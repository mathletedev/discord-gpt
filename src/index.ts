import "dotenv-safe/config";

import { ActivityType, Client, Partials } from "discord.js";
import { Configuration, OpenAIApi } from "openai";

const openai = new OpenAIApi(
	new Configuration({ apiKey: process.env.OPENAI_KEY })
);

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

	try {
		let res = (
			await openai.createCompletion({
				model: "text-davinci-003",
				prompt: message.guild ? message.content.slice(23) : message.content,
				max_tokens: 2048
			})
		).data.choices[0].text;

		if (!res) throw new Error("No response from OpenAI API");

		message.reply({
			content: res?.slice(0, 2000),
			allowedMentions: { repliedUser: false }
		});

		while (res.length > 2000) {
			res = res.slice(2000);
			message.channel.send(res.slice(0, 2000));
		}
	} catch (err) {
		message.reply({
			content: `Error occurred while processing command: ${
				(err as Error).message
			}`,
			options: { ephemeral: true }
		});
	}
});

bot.login(process.env.BOT_TOKEN);
