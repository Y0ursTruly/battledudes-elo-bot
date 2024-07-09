//handling an error that's not my fault begin
process.on('uncaughtException',function(error){
  if(error.toString().includes('429'))
    process.kill(1,'SIGKILL'); //change IP attempt
})
//handling an error that's not my fault end

const admin=[1<<3].map(a=>a.toString()), mod=[1<<4,1<<5,1<<13,1<<28,1<<40].map(a=>a.toString())
//src https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
const r=require, https=r('https'), {URL}=r('url'), {setWhole,getWhole}=r('./replDatabase.js'), auth=JSON.parse(process.env.auth)
const discord=r('discord.js'), {SlashCommandBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle}=discord, crypto=r('node:crypto')
const {LINK,addTo,takeAway,atIndex,indexAt}=r('./valueTree.js')

let ab_map=[], str_map={__proto__:null}, backup={needed:false};
for(let i=0;i<256;i++){
  ab_map[i]=String.fromCharCode(i);
  str_map[ab_map[i]]=i;
}
function str2ab(str) {
  let buf=new ArrayBuffer(str.length), bufView=new Uint8Array(buf);
  for (let i=0;i<str.length;i++) bufView[i]=str_map[str[i]];
  return buf;
}
function ab2str(buf) {
  let arr=new Uint8Array(buf), chars="";
  for(let i=0;i<arr.length;i++) chars+=ab_map[arr[i]];
  return chars;
}
async function bufferChunk(stream,maxLength=Infinity){
  return new Promise((resolve,reject)=>{
    var temp="" //adding text faster than Buffer.concat
    stream.on('data', function(chunk){
      if(temp.length+chunk.length>maxLength)
        return reject("data length exceeded");
      temp+=ab2str(chunk)
    })
    stream.on('end', function(){resolve(temp)})
    stream.on('error', reject)
  })
}
async function imageURL(data){
  return new Promise(resolve=>{
    let url=new URL(auth.imageSite)
    let options={hostname:url.hostname, port:443, path:'/', method:"POST", headers:auth.postImage}
    let request=https.request(options,response=> bufferChunk(response).then(resolve) )
    request.write(data)
    request.end()
  })
}



//button and slash command handling
const buttons={__proto__:null}, u=new Uint32Array(1);
function salt(){
  let str="";
  do{
    for(let i=0;i<16;i++)
      str+=ab_map[32+(crypto.getRandomValues(u)%95)]; //ascii chars 32 through 126
  }while(buttons[str]);
  return str; //16 chars long
}
function makeButton(label,operation,style="Primary"){
  style=ButtonStyle[style];
  let customId=salt();
  buttons[customId]=async function(interaction){
    if(await operation(interaction)) delete buttons[customId];
  }
  return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
  //return {label,style,customId};
}



//embed template stuff
function embed(title,description){
  return {
    title, description, color:0xff7f00,
    author: {
      name: 'Add this Bot',
      icon_url: 'https://i.stack.imgur.com/xRF6m.png',
      url: 'https://discord.com/oauth2/authorize?client_id=987388690844229672&permissions=1392051879024&scope=bot'
    },
    footer:{
      text: 'This bot was designed by: yours.truly.',
      icon_url: 'https://cdn.discordapp.com/avatars/292058240852819988/d5e7cfc62b17bc71a1cfe4de3dfc7174.png'
    }
  }
}



//elo
const c=400, K=64, maxGameScore=3;
function elo(Pa,Pb,Sa,Sb){
  //Pa.elo: rating of a
  //Pb.elo: rating of b
  //Sa: outcome of a
  //Sb: outcome of b
  //Ea: expected outcome of a
  //Eb: expected outcome of b
  let Qa=10**(Pa.elo/c), Qb=10**(Pb.elo/c);
  let Ea=Qa/(Qa+Qb), Eb=Qb/(Qb+Qa);
  let Ra=Pa.elo+K*(Sa-Ea), Rb=Pb.elo+K*(Sb-Eb);
  Pa.elo=Ra; Pb.elo=Rb;
}
function gameELO(region,PaID,PbID,Sa,Sb){
  let playerA=cache[region][PaID], playerB=cache[region][PbID];
  regions[region]=takeAway(regions[region],playerA)
  regions[region]=takeAway(regions[region],playerB)
  elo(playerA, playerB, Sa/maxGameScore, Sb/maxGameScore)
  
  playerA.elo=Math.round(playerA.elo)
  playerB.elo=Math.round(playerB.elo)
  regions[region]=addTo(regions[region],playerA)
  regions[region]=addTo(regions[region],playerB)
  playerA.lastGame=Date.now()
  playerB.lastGame=Date.now()
  backup.needed=true
}

module.exports={discord,gameELO,bufferChunk,imageURL,makeButton,buttons,embed,backup};
//setTimeout(_=>{global.cache={na:{},eu:{},as:{},errors:[]}},2e3) //for production, comment out this line and uncomment the code below it
(async function(){ //database handling
  await new Promise(r=>setTimeout(r,2e2))
  global.cache=await getWhole({na:{},eu:{},as:{},errors:[]})
  setInterval(function(){
    if(backup.needed){
      backup.needed=false;
      setWhole(cache);
    }
  },1e4)
})()
