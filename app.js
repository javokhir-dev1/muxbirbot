import { bot } from "./bot.js"

export const session = {}

import "./admin/admin.js"
import { Markup } from "telegraf"
import { Muxbir } from "./models/muxbir.model.js"
import { Lavha } from "./models/lavha.model.js"
import { Op } from "sequelize"

// 🏆 Top Muxbir Markaz
// 🔥 Markaz Top Lavha
// 🏙 Top Muxbir Hudud
// 🎉 Top Lavha Hudud
// 📊 Shaxsiy natija


bot.start((ctx) => {
    try {
        ctx.replyWithHTML(`<b>Assalomu alaykum, ${ctx.from.first_name}!
ZO'R MUXBIR botiga xush kelibsiz 🎥</b>

Bu bot orqali:
— umumiy reytingni ko'rasiz
— o'z natijalaringizni tekshirasiz
— eng yaxshi lavhalarni bilib borasiz`,
            Markup.keyboard([
                ["🏆 Top Muxbir Markaz", "🔥 Markaz Top Lavha"],
                ["🏙 Top Muxbir Hudud", "🎉 Top Lavha Hudud"],
                ["📊 Shaxsiy natija"],
            ]).resize())
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.hears("🏆 Top Muxbir Markaz", async (ctx) => {
    try {
        const muxbirlar = await Muxbir.findAll({
            where: { hudud: "markaz" }
        })
        const arr = []
        if (muxbirlar.length == 0) return ctx.reply("Muxbirlar topilmadi")

        for (let i = 0; i < muxbirlar.length; i++) {
            const lavhalar = await Lavha.findAll({ where: { user_id: String(muxbirlar[i].id) } })

            arr.push({ name: muxbirlar[i].full_name, score: lavhalar.length })
        }
        arr.sort((a, b) => b.score - a.score);


        let text = ""

        for (let i = 0; i < arr.length; i++) {
            text += `<b>${i + 1}. ${arr[i].name}</b> —— ${arr[i].score} ta lavha\n`
        }

        await ctx.replyWithHTML(text)
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.hears("🔥 Markaz Top Lavha", async (ctx) => {
    try {
        const muxbirlar = await Muxbir.findAll({
            where: { hudud: "markaz" }
        })
        const arr = []
        if (muxbirlar.length == 0) return ctx.reply("Muxbirlar topilmadi")

        for (let i = 0; i < muxbirlar.length; i++) {
            const lavhalar = await Lavha.findAll({ where: { user_id: String(muxbirlar[i].id) } })

            let score = 0

            for (let i = 0; i < lavhalar.length; i++) {
                score += Number(lavhalar[i].ball)
            }

            arr.push({ name: muxbirlar[i].full_name, score })
        }
        arr.sort((a, b) => b.score - a.score);


        let text = ""

        for (let i = 0; i < arr.length; i++) {
            text += `<b>${i + 1}. ${arr[i].name}</b> —— ${arr[i].score} ball\n`
        }

        await ctx.replyWithHTML(text)
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.hears("🏙 Top Muxbir Hudud", async (ctx) => {
    try {
        const muxbirlar = await Muxbir.findAll({
            where: {
                hudud: { [Op.ne]: "markaz" }
            }
        });
        if (muxbirlar.length == 0) return ctx.reply("Muxbirlar topilmadi")
        const arr = []
        for (let i = 0; i < muxbirlar.length; i++) {
            const lavhalar = await Lavha.findAll({ where: { user_id: String(muxbirlar[i].id) } })

            arr.push({ name: muxbirlar[i].full_name, score: lavhalar.length })
        }
        arr.sort((a, b) => b.score - a.score);


        let text = ""

        for (let i = 0; i < arr.length; i++) {
            text += `<b>${i + 1}. ${arr[i].name}</b> —— ${arr[i].score} ta lavha\n`
        }

        await ctx.replyWithHTML(text)
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.hears("🎉 Top Lavha Hudud", async (ctx) => {
    try {
        const muxbirlar = await Muxbir.findAll({
            where: {
                hudud: { [Op.ne]: "markaz" }
            }
        });
        const arr = []
        if (muxbirlar.length == 0) return ctx.reply("Muxbirlar topilmadi")

        for (let i = 0; i < muxbirlar.length; i++) {
            const lavhalar = await Lavha.findAll({ where: { user_id: String(muxbirlar[i].id) } })

            let score = 0

            for (let i = 0; i < lavhalar.length; i++) {
                score += Number(lavhalar[i].ball)
            }

            arr.push({ name: muxbirlar[i].full_name, score })
        }
        arr.sort((a, b) => b.score - a.score);


        let text = ""

        for (let i = 0; i < arr.length; i++) {
            text += `<b>${i + 1}. ${arr[i].name}</b> —— ${arr[i].score} ball\n`
        }

        await ctx.replyWithHTML(text)
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.hears("📊 Shaxsiy natija", async (ctx) => {
    try {
        const muxbir = await Muxbir.findOne({
            where: {
                telegram: { [Op.in]: [String(ctx.from.id), String(ctx.from.username)] }
            }, raw: true
        });

        if (!muxbir) {
            return ctx.reply("Siz bazada mavjud emassiz!")
        }

        if (!session[ctx.from.id]) session[ctx.from.id] = {}
        session[ctx.from.id]["user_id"] = muxbir.id
        ctx.reply("Oyni tanlang 👇", Markup.inlineKeyboard([
            [Markup.button.callback("yanvar", "gethisobotby_yanvar"), Markup.button.callback("fevral", "gethisobotby_fevral")],
            [Markup.button.callback("mart", "gethisobotby_mart"), Markup.button.callback("aprel", "gethisobotby_aprel")],
            [Markup.button.callback("may", "gethisobotby_may"), Markup.button.callback("iyun", "gethisobotby_iyun")],
            [Markup.button.callback("iyul", "gethisobotby_iyul"), Markup.button.callback("avgust", "gethisobotby_avgust")],
            [Markup.button.callback("sentabr", "gethisobotby_sentabr"), Markup.button.callback("oktabr", "gethisobotby_oktabr")],
            [Markup.button.callback("noyabr", "gethisobotby_noyabr"), Markup.button.callback("dekabr", "gethisobotby_dekabr")],
        ]))

    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

function isSameMonthByName(dateStr, monthName) {
    const months = [
        "yanvar", "fevral", "mart", "aprel", "may", "iyun",
        "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"
    ];

    const [, month] = dateStr.split("-");
    const monthIndex = Number(month) - 1;

    return months[monthIndex] === monthName.toLowerCase();
}

bot.action(/gethisobotby_(.+)/, async (ctx) => {
    try {
        const oy = ctx.match[1]

        if (!session[ctx.from.id]) session[ctx.from.id] = {}
        const user_id = session[ctx.from.id]["user_id"]
        console.log(user_id)
        const lavhalar = await Lavha.findAll({ where: { user_id: String(user_id) }, raw: true })

        let lavhalarSoni = 0
        let ball = 0

        for (let i = 0; i < lavhalar.length; i++) {
            if (isSameMonthByName(lavhalar[i].sana, oy)) {
                lavhalarSoni += 1
                ball += Number(lavhalar[i].ball)
            }
        }
        await ctx.reply(`📅 ${oy}:\n— Lavhalar: ${lavhalarSoni} ta\n— Ball: ${ball}`)
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})