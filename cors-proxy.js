const http=require("http"),https=require("https");
const PORT=process.argv[2]||9090;
function proxy(t,res){const u=new URL(t);const p=u.protocol==="https:"?https:http;
const req=p.get(u,{headers:{"User-Agent":"Mozilla/5.0"}},r=>{
if([301,302,303,307,308].includes(r.statusCode)&&r.headers.location)
return proxy(new URL(r.headers.location,t).href,res);
res.writeHead(r.statusCode,{"Content-Type":r.headers["content-type"]||"text/plain",
"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"*"});r.pipe(res)});
req.on("error",e=>{res.writeHead(502,{"Access-Control-Allow-Origin":"*"});res.end("Proxy error: "+e.message)});req.setTimeout(30000,()=>req.destroy())}
http.createServer((req,res)=>{if(req.method==="OPTIONS"){res.writeHead(204,{
"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS",
"Access-Control-Allow-Headers":"*"});return res.end()}
const u=new URL(req.url,"http://localhost:"+PORT);if(u.pathname!=="/proxy"){res.writeHead(200,{
"Content-Type":"text/plain","Access-Control-Allow-Origin":"*"});
return res.end("CORS Proxy running on port "+PORT+"\nUsage: /proxy?url=<encoded-url>")}
const target=u.searchParams.get("url");if(!target){res.writeHead(400,{"Access-Control-Allow-Origin":"*"});
return res.end("Missing ?url= parameter")}
if(!/^https?:\/\//i.test(target)){res.writeHead(400,{"Access-Control-Allow-Origin":"*","Content-Type":"text/plain"});
return res.end("Only http/https URLs supported")}proxy(target,res)}).listen(PORT,()=>{
console.log("CORS Proxy running at http://localhost:"+PORT+"/proxy?url=<target>")});