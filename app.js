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
                ["📊 Shaxsiy natija", "Lavha kesish"],
            ]).resize())
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

function chunkArray(arr, size = 5) {
    const result = []

    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size))
    }

    return result
}

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

bot.hears("Lavha kesish", async (ctx) => {
    try {
        ctx.reply("Oyni tanlang 👇", Markup.inlineKeyboard([
            [Markup.button.callback("yanvar", "lavha_kesish_by_yanvar"), Markup.button.callback("fevral", "lavha_kesish_by_fevral")],
            [Markup.button.callback("mart", "lavha_kesish_by_mart"), Markup.button.callback("aprel", "lavha_kesish_by_aprel")],
            [Markup.button.callback("may", "lavha_kesish_by_may"), Markup.button.callback("iyun", "lavha_kesish_by_iyun")],
            [Markup.button.callback("iyul", "lavha_kesish_by_iyul"), Markup.button.callback("avgust", "lavha_kesish_by_avgust")],
            [Markup.button.callback("sentabr", "lavha_kesish_by_sentabr"), Markup.button.callback("oktabr", "lavha_kesish_by_oktabr")],
            [Markup.button.callback("noyabr", "lavha_kesish_by_noyabr"), Markup.button.callback("dekabr", "lavha_kesish_by_dekabr")],
        ]))
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})



bot.action(/lavha_kesish_by_(.+)/, async (ctx) => {
    try {
        const oy = ctx.match[1]
        const muxbir = await Muxbir.findOne({
            where: {
                telegram: { [Op.in]: [String(ctx.from.id), String(ctx.from.username)] }
            }, raw: true
        })

        if (!muxbir) {
            return ctx.reply("Siz bazada mavjud emassiz!")
        }
        let text = "<b>Sanani tanlang 👇\n\n</b>"
        const buttons = []
        const lavhalar = await Lavha.findAll({ where: { user_id: String(muxbir.id)} })
        if (!lavhalar) {
            return ctx.reply("Lavhalar mavjud emas")
        }
        for (let i = 0; i < lavhalar.length; i++) {
            if (isSameMonthByName(lavhalar[i].sana, oy)) {
                text += `<b>${i + 1}. ${lavhalar[i].sana}</b>\n`
                buttons.push(Markup.button.callback(i+1, `lavhani_olish_${lavhalar[i].id}`))
            }
        }
        await ctx.replyWithHTML(text, Markup.inlineKeyboard(chunkArray(buttons)))

    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.action(/lavhani_olish_(.+)/, async (ctx) => {
    try {
        
    } catch(err) {
        console.log(err)
    }
})