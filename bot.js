//A bot to change my wallpaper to whatever image is uploaded to the bot-commands channel
//by Hunter G
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = ""; //put discord bot token here
const wallpaper = require('wallpaper');
let request = require(`request`);
let fs = require(`fs`);
const fsExtra = require('fs-extra')

const path = require('path');
let prefix = "!";
var imageCounter = 0;

const dir = ".\\Assets\\";// the folder where the images go to feel free to change this
imageName =  'dog.jpg'; //placeholder



function getRecentMSG(msg){
	msg.channel.messages.fetch().then((messages) => {
		const lastMessage = messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) => m.attachments.size > 0).first();
		var Attachment = (msg.attachments).array();
		//console.log(lastMessage);
    console.log("________________________________________");
    const parts = Attachment[0].name.split('.')
    const extension = parts[parts.length - 1]
    //checks to make sure the attatchment is an image if so download it
    // if its not an attatchment skip
    if(['png', 'jpg', 'jpeg'].includes(extension)){
      let name = Attachment[0].name;
      let url = Attachment[0].url;  
      console.log(name); //outputs image name	
      console.log(url); //outputs image url	
      download(url, name, msg);
    } else{
      msg.channel.send("Skipping please only send images (.png , .jpg) ");
      console.log("Skipped: " + Attachment[0].name)
    }
	}).catch(console.error);
}
//gets the lastest image that is downloaded
function getLatestFile(dirpath) {

    // Check if dirpath exist or not right here
  
    let latest;
  
    const files = fs.readdirSync(dirpath);
    files.forEach(filename => {
      // Get the stat
      const stat = fs.lstatSync(path.join(dirpath, filename));
      // Pass if it is a directory
      if (stat.isDirectory())
        return;
  
      // latest default to first file
      if (!latest) {
        latest = {filename, mtime: stat.mtime};
        return;
      }
      // update latest if mtime is greater than the current latest
      if (stat.mtime > latest.mtime) {
        latest.filename = filename;
        latest.mtime = stat.mtime;
      }
    });
  
    return latest.filename;
  }

//function that changes wallpaper
async function setWallpaper(image, msg){
	imageName = image;
	await wallpaper.set(dir + imageName);
	await wallpaper.get();
	console.log("Chnaged wallpaper to: " + dir + imageName);
  msg.channel.send("Sucessfully changed wallpaper to: " + imageName);
  imageCounter = imageCounter +1;
  }
  
  async function setWallpapers(image){
    imageName = image;
    await wallpaper.set(dir + imageName);
    await wallpaper.get();
    console.log("Chnaged wallpaper to: " + dir + imageName);
    }
	
	bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  //checks to see if the image is from the bot-commands channe
  //if not ignore any image that isnt posted there
  //to get this id turn on developer mode in Discord
  //then right click the channel and paste it here
  if(msg.channel.id === '844635875312795679'){
    getRecentMSG(msg);
  }
	if (!msg.content.startsWith(prefix) || msg.author.bot) return;
  if (!msg.content.toLowerCase().startsWith(prefix)) return;
    var input = msg.content.toLowerCase().split(" ")[0];
    input = input.slice(prefix.length);
    var args = msg.content.split(" ").slice(1);
    var joinargs = args.join(" ");
    let internet = joinargs.replace(/ /g, "+");
    if (input == 'ping') {
      msg.reply('pong');
      msg.channel.send('pong');
    }
    if (input == 'info') {
      //fix this the uptime doesnt work.
      let totalSeconds = (bot.uptime / 1000);
      let days = Math.floor(totalSeconds / 86400);
      totalSeconds %= 86400;
      let hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      let minutes = Math.floor(totalSeconds / 60);
      let seconds = Math.floor(totalSeconds % 60);
      let uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
      msg.channel.send('Current pictures sent: ' + imageCounter);
      msg.channel.send('Bot uptime: ' + uptime);
    }
    // Deletes all the images inn the Asset Folder
      if (input == 'clear') {
        fsExtra.emptyDirSync(dir)
        } 
        //a command to manually change the wallpaper to an image in the Assets folder
        //was used for testing
    if (input == 'change') {
      let image = args[0];
      msg.channel.send("Chnaged wallpaper to: " +  image);
      setWallpaper(image, msg);

    }
});

//gets the latest file added to a folder
function getLatestFile(dirpath) {

    // Check if dirpath exist or not right here
  
    let latest;
  
    const files = fs.readdirSync(dirpath);
    files.forEach(filename => {
      // Get the stat
      const stat = fs.lstatSync(path.join(dirpath, filename));
      // Pass if it is a directory
      if (stat.isDirectory())
        return;
  
      // latest default to first file
      if (!latest) {
        latest = {filename, mtime: stat.mtime};
        return;
      }
      // update latest if mtime is greater than the current latest
      if (stat.mtime > latest.mtime) {
        latest.filename = filename;
        latest.mtime = stat.mtime;
      }
    });
  
    return latest.filename;
  }

//downloads and saves the image from the disdcord url to the folder
function download(url, name, msg){
    request.get(url).on('error', console.error).pipe(fs.createWriteStream(dir + name));
	console.log("Downloaded image: " + name + " from: " + url);
	msg.channel.send("Downloaded image: " +name +" with url: " + url);
	let imageName = getLatestFile(dir);
  msg.channel.send("Setting wallpaper to "+ imageName);
  setTimeout(() => {setWallpaper(imageName, msg); }, 500);
}