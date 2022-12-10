import "dotenv-safe/config";

import { ActivityType, Client, Partials } from "discord.js";

import { openai } from "./lib/openai";

const bot = new Client({
	intents: ["DirectMessages", "Guilds", "GuildMessages"],
	partials: [Partials.Channel]
});

bot.on("ready", () => {
	bot.user?.setActivity({ type: ActivityType.Playing, name: "OpenAI" });

	console.log("Bot is online!");
});

bot.on("messageCreate", async message => {
	if (
		(message.guild && bot.user && !message.mentions.has(bot.user)) ||
		message.author.bot
	)
		return;

	await message.channel.sendTyping();

	message.reply({
		content:
			(
				await openai.createCompletion({
					model: "text-davinci-003",
					prompt: message.guild ? message.content.slice(23) : message.content,
					max_tokens: 4000
				})
			).data.choices[0].text ??
			"Sorry, I didn't understand that. Please try again.",
		allowedMentions: { repliedUser: false }
	});
});

bot.login(process.env.BOT_TOKEN);
