const Discord = require('discord.js');
const http = require('http');

const client = new Discord.Client();

const token = 'MzU5MDU0MTA4Njg0MTg5Njk3.DKByhw.TTrBp5F_D6bNWfY0NXPQE2TQ0sE';

client.on('message', message => {
	if (message.content.startsWith('!stat ')) {
		let user = message.content.split(' ')[1];
		let userEncoded = user.replace('#', '%23');
		http.get({
			host: 'gigantic-mmr-api.azurewebsites.net',
			path: '/leaderboards/' + userEncoded
		}, res => {
			let rawData = '';
			res.on('data', chunk => rawData += chunk);
			res.on('end', () => {
				let json = JSON.parse(rawData);
				let data = json.data[user];

				const embed = new Discord.RichEmbed();
				embed.setTitle(user);
				embed.addField('MMR', Math.round(data.all.total.motiga_skill * 100), true);
				embed.addField('Level', data.all.total.rank, true);
				embed.addField('Win Rate', Math.round((data.all.total.wins / data.all.total.total_games) * 100) + '%', true);
				embed.addField('Games Played', data.all.total.total_games, true);
				embed.addField('Hours Played', Math.round(data.all.total.time_played / 3600), true);
				embed.addField('Most Played Hero', getMostPlayedHero(data), true);
				message.channel.send(embed);
			});
		});
	}
});

function getMostPlayedHero(data) {
	let time = 0;
	let mostPlayedHero = 'n/a';
	for (let hero in data) {
		if (data.hasOwnProperty(hero) && hero !== 'all') {
			if (data[hero].total.time_played > time) {
				time = data[hero].total.time_played;
				mostPlayedHero = hero;
			}
		}
	}
	return humanise(mostPlayedHero) + ': ' + Math.round(time / 3600) + 'hrs';
}

function humanise(str) {
	var frags = str.split('_');
	for (let i = 0; i < frags.length; i++) {
		frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
	}
	return frags.join(' ');
}

client.login(token).then(t => console.log);