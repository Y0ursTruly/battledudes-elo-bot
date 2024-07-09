process.env.auth=JSON.stringify(require('./auth.json')) //comment this line in production(and exclude the intended file) and set key 'auth' to it in secrets(.env)
//server for uptimebot to ping begin
/*require('http').createServer((req,res)=>{
  res.end("hi, this is a discord bot :D")
}).listen(process.env.PORT||8080)*/
//server for uptimebot to bing end

//this code has 2 global variables, 'cache' and 'regions'
const r=require, fs=r('node:fs'), {token,allowed}=JSON.parse(process.env.auth)
const {LINK,addTo,takeAway,atIndex,indexAt,moreThan}=r('./valueTree.js')
const {discord,gameELO,bufferChunk,imageURL,makeButton,buttons,embed,backup}=r('./utils.js')
const {REST,Routes,Client,GatewayIntentBits:FLAGS,ApplicationCommandOptionType:slashOptions,EmbedBuilder,ActionRowBuilder}=discord
const intents=[
  FLAGS.GuildMessages, FLAGS.Guilds, FLAGS.DirectMessages, FLAGS.GuildMessageReactions, FLAGS.DirectMessageReactions,
  FLAGS.GuildEmojisAndStickers, FLAGS.GuildMessageTyping, FLAGS.GuildVoiceStates
]
eval=(function eval(){ console.log([arguments[0],arguments.callee.caller]) }).bind(global) //1392051879024
var regionNames={na:"North America", eu:"Europe", as:"Asia"}
global.regions={na:LINK(),eu:LINK(),as:LINK()}
var bot=new Client({intents}), rest=null

Object.defineProperty(global,'cache',{async set(value){
  Object.keys(regionNames).forEach(function(region){
    let keys=Object.keys(value[region])
    for(let i=0;i<keys.length;i++){
      regions[region]=addTo(regions[region], value[region][keys[i]])
      //adds to the valuetree by attribute of elo and stores the object there
    }
  })
  Object.defineProperty(global,'cache',{value})
  bot.login(token) //only login after cache loaded
  rest=new REST({version:'10'}).setToken(token)
},configurable:true})

bot.on('ready', async function({user}){
  await rest.put(Routes.applicationCommands(user.id),{body})
  console.log([`logged in as ${user.username}#${user.discriminator}`])
})




var commands={
  register:{
    async handler(interaction){
      let userID=interaction.user.id
      if(cache.na[userID] || cache.eu[userID] || cache.as[userID])
        return await interaction.reply({content:"You are already registered ;-;",ephemeral:true});
      Object.keys(regions).forEach(region=>{
        const user={id:userID,lastGame:Date.now(),elo:1e3,registered:Date.now()}
        cache[region][userID]=user
        regions[region]=addTo(regions[region],user)
      })
      backup.needed=true
      await interaction.reply({content:"You are now registered :D",ephemeral:true})
    },
    description: "Registers your discord user into the elo system",
    options: [],
    name: "register"
  },
  info:{
    async handler(interaction){
      let userID=(interaction.options.getUser('user')||interaction.user).id
      if(!cache.na[userID] && !cache.eu[userID] && !cache.as[userID])
        return await interaction.reply({content:"INVALID USER",ephemeral:true});
      let message=`Info of <@${userID}>\n\n`
      Object.keys(regions).forEach(region=>{
        let user=cache[region][userID], rank=moreThan(regions[region],user)+1 //regions[region].count-indexAt(regions[region],user)
        message+=`${region.toUpperCase()}: ELO(${user.elo}) ........ RANK(${Date.now()-user.lastGame>1000*60*60*24*7? "INACTIVE": rank})\n`
        //for each region the user sees their rank IF THEY ARE ACTIVE in that region
      })
      message+=`\nDate Registered: ${new Date(cache.na[userID].registered).toGMTString()}`

      let latestDate=cache.na[userID].lastGame
      if(cache.eu[userID].lastGame>latestDate) latestDate=cache.eu[userID].lastGame;
      if(cache.as[userID].lastGame>latestDate) latestDate=cache.as[userID].lastGame;
      message+=`\nLast time ranked: ${new Date(latestDate).toGMTString()}`

      await interaction.reply({
        embeds:[embed("Battledudes Player ELO Information",message)]
      })
    },
    description: "Displays battledudes elo info on the selected player",
    options: [
      {type:slashOptions.User,required:false,name:"user",  description:"the user to display information of"}
    ],
    name: "info"
  },
  score:{
    async handler(interaction){
      let {options}=interaction, region=options.getString('region'), PaVoted=false, PbVoted=false
      let PaID=options.getUser('playera').id, playerA=cache[region][PaID], scoreA=options.getInteger('scorea')
      let PbID=options.getUser('playerb').id, playerB=cache[region][PbID], scoreB=options.getInteger('scoreb')

      if(playerA===playerB) return await interaction.reply({content:"bruh? what are you doing!?",ephemeral:true});
      //above if statement because a player playing against themselves isn't a thing

      if(!playerA||!playerB) return await interaction.reply({content:"at least one player mentioned is not registered",ephemeral:true});

      let message=`A match between <@${PaID}> vs <@${PbID}> in the region of ${regionNames[region]} occured\n`
      message+=`Apparently with the scores of <@${PaID}> with \`${scoreA}\` and <@${PbID}> with \`${scoreB}\`\n`
      message+=`This item is awaiting either moderator approval or agreement from both parties mentioned`

      await interaction.reply({
        embeds:[embed("Battledues Ranked Match Instance",message)],
        components:[new ActionRowBuilder().addComponents(
          makeButton("Approve?", async function(click){
            if(click.user.id===PaID||click.user.id===PbID){
              if(click.user.id===PaID){
                if(PaVoted) await click.reply({content:"Your approval was already recorded :/",ephemeral:true});
                else{
                  PaVoted=true
                  await click.reply({content:`<@${PaID}> approves the score`})
                }
              }
              if(click.user.id===PbID){
                if(PbVoted) await click.reply({content:"Your approval was already recorded :/",ephemeral:true});
                else{
                  PbVoted=true
                  await click.reply({content:`<@${PbID}> approves the score`})
                }
              }
            }
            if(allowed[click.user.id]||(PaVoted&&PbVoted)){
              gameELO(region,PaID,PbID,scoreA,scoreB);
              if(click.user.id!==PaID&&click.user.id!==PbID) await click.reply({content:"Match Score Approved"});
              else await click.followUp({content:"Match Score Approved"});
              await interaction.editReply({
                embeds:[embed("Battledues Ranked Match Instance",message)],
                components:[new ActionRowBuilder().addComponents(makeButton("Approved",function(){}).setDisabled(true))]
              })
              return true; //true, delete handling for button
            }
            else if(click.user.id!==PaID&&click.user.id!==PbID)
              await click.reply({content:"You are not authorised to approve >:(",ephemeral:true});
          }),
          makeButton("Disapprove?", async function(click){
            if(allowed[click.user.id]){
              await click.reply({content:"Match Score Disapproved"})
              await interaction.editReply({
                embeds:[embed("Battledues Ranked Match Instance",message)],
                components:[new ActionRowBuilder().addComponents(makeButton("Disapproved",function(){},"Danger").setDisabled(true))]
              })
              return true; //true, delete handling for button
            }
            else await interaction.followUp({content:"You are not authorised to disapprove >:(",ephemeral:true});
          },"Danger")
        )]
      })
    },
    description: "Upload the score of exactly ONE match at a time and await either moderator approval or the agreement of both parties in the match",
    options: [
      {
        type:slashOptions.String,required:true,name:"region",  description:"the region the match was played in",
        choices:[{name:"North America",value:"na"},{name:"Europe",value:"eu"},{name:"Asia",value:"as"}]
      },
      {type:slashOptions.User,required:true,name:"playera",  description:"The discord account of player A"},
      {
        type:slashOptions.Integer,required:true,name:"scorea",  description:"The score of player A",
        choices:[{name:"Zero",value:0},{name:"One",value:1},{name:"Two",value:2},{name:"Three",value:3}]
      },
      {type:slashOptions.User,required:true,name:"playerb",  description:"The discord account of player B"},
      { 
        type:slashOptions.Integer,required:true,name:"scoreb",  description:"The score of player B",
        choices:[{name:"Zero",value:0},{name:"One",value:1},{name:"Two",value:2},{name:"Three",value:3}]
      },
    ],
    name: "score"
  },
  leaderboard:{
    async handler(interaction){
      let region=interaction.options.getString('region')
      let message=`Remember: ELO is **NOT** an exact measure of skill\n\n`, regional=""
      let list=regions[region], index=list.count-1, amount=10 //amount is amount of players to show
      while(amount>0 && index>=0){
        let listing=atIndex(list,index)
        for(let i=0;i<listing.length;i++){
          if(amount<=0) break;
          index--; //index decrements to ensure 10 active players are found OR the list runs out
          if(Date.now()-listing[i].lastGame > 1000*60*60*24*7) continue; //if player inactive for over a week, ignore
          regional+=`- ${10-(--amount)}) ELO: ${listing[i].elo} ........ PLAYER: \`${ (await bot.users.fetch(listing[i].id)).username }\`\n`;
        }
      }
      regional||="SO NOBODY IS ACTIVE IN THIS ENTIRE REGION!?!?";
      await interaction.reply({embeds:[embed(`Battledudes ELO leaderboard for the region of ${regionNames[region]}`,message+regional)]})
    },
    description: "Shows the top 10 active players(within the last 7 days) of a given region",
    options: [
      {
        type:slashOptions.String,required:true,name:"region",  description:"the regional leaderboard you want displayed",
        choices:[{name:"North America",value:"na"},{name:"Europe",value:"eu"},{name:"Asia",value:"as"}]
      }
    ],
    name: "leaderboard"
  }
}
var body=Object.values(commands)

bot.on('interactionCreate', async function(interaction){
  try{
    if(interaction.isButton()){
      let button=buttons[interaction.customId]
      if(button) await button(interaction);
      else interaction.reply({content:"OLD MESSAGE; please repeat command :(",ephemeral:true}); //interaction failed
    }

    else if(interaction.isChatInputCommand())
      await commands[interaction.commandName]?.handler(interaction);
  }
  catch(err){
    err.timestamp=Date.now()
    cache.errors.push(err)
    backup.needed=true
    console.log(err)
    try{await interaction.reply({content:"Error while executing command ;-;",ephemeral:true})}
    catch{/*what else is there to do ;-;*/}
  }
})
