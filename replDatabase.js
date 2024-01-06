//replit really ceased to host for free (tough times), lemme at least give some sorry excuse of cope code
const fs=require('node:fs'), path=require('node:path')
let record=path.join(__dirname,"records.json")
module.exports={
  setWhole(obj){
    fs.writeFileSync(record,JSON.stringify(obj))
  },
  getWhole(obj){
    try{return JSON.parse(fs.readFileSync(record))}
    catch{
      fs.writeFileSync(record,JSON.stringify(obj))
      return obj
    }
  }
}

//what it used to be
/*var {XMLHttpRequest}=require('./XMLHttpRequest.js');
var {REPLIT_DB_URL}=process.env;
function splitOnLength(str,n){
  let cur=0, list=[]
  for(let i=0;i<str.length;i++){
    cur=Math.floor(i/n)
    list[cur]?list[cur]+=str[i]:list[cur]=str[i]
  }
  return list
}

async function get(key,url=REPLIT_DB_URL){
  return await new Promise((r,j)=>{
    var xhd=new XMLHttpRequest();
    if(url[url.length-1]!="/"){url=url+"/"}
    xhd.open('GET',url+key,true);
    xhd.send();
    xhd.onload=()=>{
      try{r(JSON.parse(xhd.responseText));}
      catch(err){j(err);}
    }
  })
}
async function set(key,value,url=REPLIT_DB_URL){
  return await new Promise(r=>{
    var xhd=new XMLHttpRequest();
    if(url[url.length-1]=="/"){url=url.substring(0,url.length-1)}
    let body=encodeURIComponent(key)+"="+encodeURIComponent(JSON.stringify(value))
    xhd.open('POST',url,true);
    xhd.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhd.send(body); xhd.onload=r;
  });
}
async function remove(key,url=REPLIT_DB_URL){
  return await new Promise(r=>{
    var xhd=new XMLHttpRequest();
    if(url[url.length-1]!="/"){url=url+"/"}
    xhd.open('DELETE',url+encodeURIComponent(key),true);
    xhd.send(); xhd.onload=r;
  })
}

async function getList(url=REPLIT_DB_URL){
  return await new Promise(r=>{
    var xhd=new XMLHttpRequest();
    if(url[url.length-1]=="/"){url=url.substring(0,url.length-1)}
    xhd.open('GET',url+'?encode=true&prefix=',true);
    xhd.send();
    xhd.onload=()=>{r(
      xhd.responseText.length?
      xhd.responseText.split('\n')
      .map(key=>decodeURIComponent(key))
      .sort((num1,num2)=>num1-num2):[]
    );}
  })
}
async function getAll(url=REPLIT_DB_URL){
  return await new Promise(async(r)=>{
    let arr=await getList(url), obj={};
    for(let part of arr){
      obj[part]=await get(part,url);
    }
    r(obj);
  })
}
async function setAll(obj,url=REPLIT_DB_URL){
  let keys=Object.keys(obj);
  for(let i=0;i<keys.length;i++)
    await set(keys[i],obj[ keys[i] ],url);
}
async function removeAll(url=REPLIT_DB_URL){
  let arr=await getList(url);
  for(let part of arr){
    await remove(part,url);
  }
}
async function getWhole(DEFAULT={},url=REPLIT_DB_URL){
  if(!(await getList(url)).length){
    await set('0',JSON.stringify(DEFAULT),url);
    //the assumption in the line above is that default stringified is < 5MB
    for(let i=1;i<10;i++) await set(i+'','',url);
  }
  return JSON.parse(Object.values(await getAll(url)).join(''));
}
async function setWhole(obj={},url=REPLIT_DB_URL){
  let text=JSON.stringify(obj), n=(5*(2**20))-1;
  await setAll(splitOnLength(text,n),url);
}

module.exports={get,set,remove,getList,getAll,setAll,removeAll,getWhole,setWhole};*/