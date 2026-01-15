import { bot } from "../bot.js"
import { Markup } from "telegraf"

import { session } from "../app.js"
import { Muxbir } from "../models/muxbir.model.js"
import { Lavha } from "../models/lavha.model.js";
import { Op, where } from "sequelize";

// ➕ Muxbir qo'shish
// 🗑 Muxbir o'chirish
// 📝 Lavha kiritish
// 📊 Hisobotlar

const regionsInlineKeyboard = Markup.inlineKeyboard(
    [
        [
            Markup.button.callback("Andijon", "hudud_andijon"),
            Markup.button.callback("Buxoro", "hudud_buxoro"),
            Markup.button.callback("Farg'ona", "hudud_fargona"),
        ],
        [
            Markup.button.callback("Jizzax", "hudud_jizzax"),
            Markup.button.callback("Xorazm", "hudud_xorazm"),
            Markup.button.callback("Namangan", "hudud_namangan"),
        ],
        [
            Markup.button.callback("Navoiy", "hudud_navoiy"),
            Markup.button.callback("Qashqadaryo", "hudud_qashqadaryo"),
            Markup.button.callback("Samarqand", "hudud_samarqand"),
        ],
        [
            Markup.button.callback("Sirdaryo", "hudud_sirdaryo"),
            Markup.button.callback("Surxondaryo", "hudud_surxondaryo"),
            Markup.button.callback("Toshkent viloyati", "hudud_toshkent_vil"),
        ],
        [
            Markup.button.callback("Qoraqalpog'iston", "hudud_qoraqalpogiston"),
        ],
    ]
);

const regionsInlineKeyboardForHisobots = Markup.inlineKeyboard(
    [
        [
            Markup.button.callback("Andijon", "hisobot_andijon"),
            Markup.button.callback("Buxoro", "hisobot_buxoro"),
            Markup.button.callback("Farg'ona", "hisobot_fargona"),
        ],
        [
            Markup.button.callback("Jizzax", "hisobot_jizzax"),
            Markup.button.callback("Xorazm", "hisobot_xorazm"),
            Markup.button.callback("Namangan", "hisobot_namangan"),
        ],
        [
            Markup.button.callback("Navoiy", "hisobot_navoiy"),
            Markup.button.callback("Qashqadaryo", "hisobot_qashqadaryo"),
            Markup.button.callback("Samarqand", "hisobot_samarqand"),
        ],
        [
            Markup.button.callback("Sirdaryo", "hisobot_sirdaryo"),
            Markup.button.callback("Surxondaryo", "hisobot_surxondaryo"),
            Markup.button.callback("Toshkent viloyati", "hisobot_toshkent_vil"),
        ],
        [
            Markup.button.callback("Qoraqalpog'iston", "hisobot_qoraqalpogiston"),
        ],
        [
            Markup.button.callback("Barchasi", "hisobot_barchasi"),
        ],
    ]
);

const months = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
];

const weekDays = ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Yak"];

function getCurrentDate() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    return `${day}-${month}-${year}`;
}

function chunkArray(arr, size = 5) {
    const result = []

    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size))
    }

    return result
}

function getCalendarKeyboard(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const startDayIndex = firstDay === 0 ? 6 : firstDay - 1; // Dushanbadan boshlash
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const keyboard = [];

    keyboard.push([Markup.button.callback(`${months[month]} ${year}`, 'ignore')]);

    const weekHeader = weekDays.map(day => Markup.button.callback(day, 'ignore'));
    keyboard.push(weekHeader);

    let currentWeek = [];

    for (let i = 0; i < startDayIndex; i++) {
        currentWeek.push(Markup.button.callback(" ", "ignore"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day < 10 ? `0${day}` : day;
        const monthStr = (month + 1) < 10 ? `0${month + 1}` : (month + 1);
        const fullDate = `${dayStr}-${monthStr}-${year}`;

        currentWeek.push(Markup.button.callback(day.toString(), `date_${fullDate}`));

        if (currentWeek.length === 7) {
            keyboard.push(currentWeek);
            currentWeek = [];
        }
    }

    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(Markup.button.callback(" ", "ignore"));
        }
        keyboard.push(currentWeek);
    }

    const prevMonthDate = new Date(year, month - 1);
    const nextMonthDate = new Date(year, month + 1);

    keyboard.push([
        Markup.button.callback("◀️", `calendar_${prevMonthDate.getFullYear()}_${prevMonthDate.getMonth()}`),
        Markup.button.callback("▶️", `calendar_${nextMonthDate.getFullYear()}_${nextMonthDate.getMonth()}`)
    ]);

    return Markup.inlineKeyboard(keyboard);
}

function capitalize(text = "") {
    if (!text) return "";
    return text[0].toUpperCase() + text.slice(1);
}

bot.command("admin", (ctx) => {
    try {
        ctx.reply("Admin panel", Markup.inlineKeyboard([
            [Markup.button.callback("➕ Muxbir qo'shish", "add_muxbir")],
            [Markup.button.callback("🗑 Muxbir o'chirish", "delete_muxbir")],
            [Markup.button.callback("📝 Lavha kiritish", "add_lavha")],
            [Markup.button.callback("📊 Hisobotlar", "get_hisobots")],
        ]))
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

// Add muxbir
bot.action("add_muxbir", async (ctx) => {
    try {
        await ctx.reply("Tanlang 👇", Markup.inlineKeyboard([
            [Markup.button.callback("Markaz", "markaz"),
            Markup.button.callback("Hudud", "hudud")]
        ]))
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.action("markaz", async (ctx) => {
    try {
        await ctx.reply("Yangi muxbir ismini kiriting")
        if (!session[ctx.from.id]) session[ctx.from.id] = {}
        session[ctx.from.id]["state"] = "waiting_muxbir_name"
        session[ctx.from.id]["user"] = {
            hudud: "markaz"
        }
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.action("hudud", (ctx) => {
    try {
        ctx.reply("Hududni tanlang 👇", regionsInlineKeyboard)
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.action(/hudud_(.+)/, async (ctx) => {
    try {
        const hudud = ctx.match[1]
        if (!session[ctx.from.id]) session[ctx.from.id] = {}
        session[ctx.from.id]["user"] = {
            hudud: hudud
        }
        session[ctx.from.id]["state"] = "waiting_muxbir_name"
        await ctx.reply("Yangi muxbir ismini kiriting")
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})
// Add muxbir

// delete muxbir
bot.action("delete_muxbir", async (ctx) => {
    try {
        const muxbirs = await Muxbir.findAll()
        for (let i = 0; i < muxbirs.length; i++) {
            ctx.replyWithHTML(
                `<b>Ismi: </b>${muxbirs[i].full_name}\n<b>Telegram (username yoki ID): </b> ${muxbirs[i].telegram}\n<b>Hudud: </b>${capitalize(muxbirs[i].hudud)}`,
                Markup.inlineKeyboard([
                    [Markup.button.callback("❌ Muxbirni o'chirish", `delete_muxbir_${muxbirs[i].id}`)]
                ])
            )
        }
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.action(/delete_muxbir_(.+)/, async (ctx) => {
    try {
        const muxbir_id = ctx.match[1]
        await Muxbir.destroy({ where: { id: muxbir_id } })
        await ctx.deleteMessage()
            .catch((err) => console.log(err))
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

// delete muxbir

// Add lavha
bot.action("add_lavha", async (ctx) => {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        await ctx.reply("Sanani tanlang 👇", getCalendarKeyboard(year, month));
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})


bot.action(/calendar_(\d+)_(\d+)/, async (ctx) => {
    const year = parseInt(ctx.match[1]);
    const month = parseInt(ctx.match[2]);

    try {
        await ctx.editMessageText("Sanani tanlang:", getCalendarKeyboard(year, month));
    } catch (e) {
        console.log("Xatolik: foydalanuvchi tez-tez tugmani bosdi.");
    }
});

bot.action(/date_(\d{2}-\d{2}-\d{4})/, async (ctx) => {
    try {
        const selectedDate = ctx.match[1];
        await ctx.reply(`Tanlangan sana: ${selectedDate}`)
        if (!session[ctx.from.id]) session[ctx.from.id] = {}
        session[ctx.from.id]["selected_date"] = selectedDate
        await ctx.reply("Efir vaqtini tanlang", Markup.inlineKeyboard([
            [Markup.button.callback("Tongi", "type_lavha_tongi"),
            Markup.button.callback("Kechki", "type_lavha_kechki")],
        ]))
    } catch (err) {
        console.log(err)
    }
});

bot.action(/type_lavha_(.+)/, async (ctx) => {
    try {
        const type_lavha = ctx.match[1]
        if (!session[ctx.from.id]) session[ctx.from.id] = {}
        session[ctx.from.id]["type_lavha"] = type_lavha

        const muxbirs = await Muxbir.findAll()

        if (muxbirs.length == 0) return ctx.reply("Hozircha muxbirlar mavjud emas!")

        let textMarkaz = []
        let textHudud = []

        await ctx.reply("Muxbirni tanlang 👇")
        for (let i = 0; i < muxbirs.length; i++) {
            if (muxbirs[i].hudud == "markaz") {
                textMarkaz.push(muxbirs[i])
            } else {
                textHudud.push(muxbirs[i])
            }
            // ctx.replyWithHTML(
            //     `<b>Ismi: </b>${muxbirs[i].full_name}\n<b>Telegram (username yoki ID): </b> ${muxbirs[i].telegram}\n<b>Hudud: </b>${capitalize(muxbirs[i].hudud)}`,
            //     Markup.inlineKeyboard([
            //         [Markup.button.callback("✅ Muxbirni tanlash", `get_muxbir_to_lavha_${muxbirs[i].id}`)]
            //     ])
            // )
        }

        let text = ""
        const buttons = []


        const result = textMarkaz.concat([{ full_name: "-" }], textHudud)
        let id = 0
        console.log(result)
        for (let i = 0; i < result.length; i++) {
            if (result[i].full_name.includes("-")) {
                text += "------------------\n"
            } else {
                console.log(result)
                id += 1
                text += `<b>${id}. ${result[i].full_name}</b>\n`
                buttons.push(Markup.button.callback(id, `get_muxbir_to_lavha_${result[i].id}`))
            }
        }

        ctx.replyWithHTML(text, Markup.inlineKeyboard(chunkArray(buttons)))
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.action(/get_muxbir_to_lavha_(.+)/, async (ctx) => {
    try {
        if (!session[ctx.from.id]) session[ctx.from.id] = {}
        const muxbir_id = ctx.match[1]
        session[ctx.from.id]["user_id"] = muxbir_id
        // const type_lavha = session[ctx.from.id]["type_lavha"]
        // const selected_date = session[ctx.from.id]["selected_date"]

        await ctx.reply("Zo'r endi bu lavhani baholang!", Markup.inlineKeyboard([
            [Markup.button.callback("⭐️", "add_baho_1"),
            Markup.button.callback("⭐️⭐️", "add_baho_2")],
            [Markup.button.callback("⭐️⭐️⭐️", "add_baho_3"),
            Markup.button.callback("⭐️⭐️⭐️⭐️", "add_baho_4"),
            Markup.button.callback("⭐️⭐️⭐️⭐️⭐️", "add_baho_5")],
        ]))

    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.action(/add_baho_(.+)/, async (ctx) => {
    try {
        await ctx.deleteMessage()
            .catch((err) => console.log(err))
        const ball = ctx.match[1]
        const type_lavha = session[ctx.from.id]["type_lavha"]
        const user_id = session[ctx.from.id]["user_id"]
        const sana = session[ctx.from.id]["selected_date"]

        await Lavha.create({ user_id, type_lavha, sana, ball })

        await ctx.reply("Lavha muvaffaqiyatli qo'shildi! ✅")
        const user = await Muxbir.findOne({ where: { id: user_id } })
        await ctx.replyWithHTML(`<b>Muxbir:</b> ${user.full_name}\n<b>Lavha turi: </b> ${type_lavha}\n<b>sana: </b> ${sana}\n<b>ball: </b> ${ball} ta yulduz`)
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

// Add lavha

// Get hisobots

bot.action("get_hisobots", async (ctx) => {
    try {
        ctx.replyWithHTML("Kerakli bo'limni tanlang 👇", Markup.inlineKeyboard([
            [Markup.button.callback("Bugungi lavhalar", "bugungi_lavhalar")],
            [Markup.button.callback("Oy bo'yicha statistika", "oy_boyicha")],
            [Markup.button.callback("Eng yaxshi muxbir", "eng_yaxshi_muxbir")],
        ]))
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.action("bugungi_lavhalar", (ctx) => {
    try {
        ctx.reply("Efir vaqtini tanlang 👇", Markup.inlineKeyboard([
            [Markup.button.callback("Tongi", "hisobot_vaqt_tongi"), Markup.button.callback("Kechki", "hisobot_vaqt_kechki")]
        ]))
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.action(/hisobot_vaqt_(.+)/, async (ctx) => {
    try {
        const hisobot_vaqt = ctx.match[1]
        const muxbirlar = await Muxbir.findAll()

        let muxbirlarsoni = 0

        for (let i = 0; i < muxbirlar.length; i++) {
            let ball = 0
            let lavha_soni = 0
            const lavhalar = await Lavha.findAll({ where: { type_lavha: String(hisobot_vaqt), user_id: String(muxbirlar[i].id), sana: getCurrentDate() }, raw: true })
            for (let i = 0; i < lavhalar.length; i++) {
                ball += Number(lavhalar[i].ball)
                lavha_soni += 1
            }
            if (lavha_soni > 0) {
                muxbirlarsoni += 1
                ctx.reply(`Muxbir: ${muxbirlar[i].full_name}\nlavhalar soni: ${lavha_soni} ta\nball: ${ball}`)
            }
        }

        if (muxbirlarsoni == 0) {
            ctx.reply("Bugun lavha bergan muxbirlar topilmadi")
        }
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.action("oy_boyicha", (ctx) => {
    try {
        ctx.reply("Oyni tanlang 👇", Markup.inlineKeyboard([
            [Markup.button.callback("yanvar", "hisobot_by_yanvar"), Markup.button.callback("fevral", "hisobot_by_fevral")],
            [Markup.button.callback("mart", "hisobot_by_mart"), Markup.button.callback("aprel", "hisobot_by_aprel")],
            [Markup.button.callback("may", "hisobot_by_may"), Markup.button.callback("iyun", "hisobot_by_iyun")],
            [Markup.button.callback("iyul", "hisobot_by_iyul"), Markup.button.callback("avgust", "hisobot_by_avgust")],
            [Markup.button.callback("sentabr", "hisobot_by_sentabr"), Markup.button.callback("oktabr", "hisobot_by_oktabr")],
            [Markup.button.callback("noyabr", "hisobot_by_noyabr"), Markup.button.callback("dekabr", "hisobot_by_dekabr")],
        ]))
    } catch (err) {
        console.log(err)
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

bot.action(/hisobot_by_(.+)/, async (ctx) => {
    try {
        const oy = ctx.match[1]
        const muxbirlar = await Muxbir.findAll()
        if (muxbirlar.length == 0) return ctx.reply("Hozircha muxbirlar mavjud emas")
        await ctx.reply(`${oy.toUpperCase()}dagi natija 👇`)
        for (let i = 0; i < muxbirlar.length; i++) {
            let tongi_efir_lavha = 0
            let kechki_efir_lavha = 0
            let tongi_efir_ball = 0
            let kechki_efir_ball = 0

            const lavhalar = await Lavha.findAll({ where: { user_id: String(muxbirlar[i].id) }, raw: true })
            for (let i = 0; i < lavhalar.length; i++) {
                if (!lavhalar[i].sana) continue
                if (isSameMonthByName(lavhalar[i].sana, oy)) {
                    if (lavhalar[i].type_lavha == "tongi") {
                        tongi_efir_lavha += 1
                        tongi_efir_ball += Number(lavhalar[i].ball)
                    } else {
                        kechki_efir_lavha += 1
                        kechki_efir_ball += Number(lavhalar[i].ball)
                    }
                }
            }
            await ctx.replyWithHTML(`<b>Muxbir: </b>${muxbirlar[i].full_name}\n<b>Tongi efirda: </b>${tongi_efir_lavha} ta lavha, ${tongi_efir_ball} ball\n<b>Kechki efirda: </b>${kechki_efir_lavha} ta lavha, ${kechki_efir_ball} ball\n<b>Umumiy: </b>${tongi_efir_lavha + kechki_efir_lavha} ta lavha, ${tongi_efir_ball + kechki_efir_ball} ball`)
        }
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

bot.action("eng_yaxshi_muxbir", async (ctx) => {
    try {
        ctx.reply("Tanlang 👇", Markup.inlineKeyboard([
            [Markup.button.callback("Markaz", "hisobot_markaz"), Markup.button.callback("Hudud", "action_hudud")]
        ]))
    } catch (err) {
        console.log(err)
        ctx.reply("Xatoli yuz berdi")
    }
})


async function getTop3MuxbirText(groupedLavhalar, Muxbir) {
    const users = [];

    for (const userId in groupedLavhalar) {
        const lavhalar = groupedLavhalar[userId];

        const totalBall = lavhalar.reduce(
            (sum, l) => sum + Number(l.ball),
            0
        );

        users.push({
            user_id: userId,
            totalBall,
            lavhaCount: lavhalar.length
        });
    }

    const top3 = users
        .sort((a, b) => b.totalBall - a.totalBall)
        .slice(0, 3);

    let text = "";

    for (let i = 0; i < top3.length; i++) {
        const user = top3[i];

        const muxbir = await Muxbir.findOne({
            where: { id: user.user_id },
            attributes: ["full_name"]
        });

        const fullName = muxbir?.full_name || "Noma'lum";

        text += `${i + 1}-o'rin
Muxbir: ${fullName}
Ball: ${user.totalBall} ball
Lavhalar: ${user.lavhaCount} ta

`;
    }

    return text.trim();
}


bot.action("action_hudud", async (ctx) => {
    try {
        ctx.reply("Xududni tanlang 👇", regionsInlineKeyboardForHisobots)
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})


bot.action(/hisobot_(.+)/, async (ctx) => {
    try {
        const hudud = ctx.match[1]
        let muxbirlar = await Muxbir.findAll({ where: { hudud }, raw: true })

        if (hudud == "barchasi") muxbirlar = await Muxbir.findAll({
            where: {
                hudud: { [Op.ne]: "markaz" }
            },
        });

        if (muxbirlar.length == 0) return ctx.reply("Xududda muxbirlar topilmadi")

        const arr = {}

        for (let i = 0; i < muxbirlar.length; i++) {
            const lavhalar = await Lavha.findAll({ where: { user_id: String(muxbirlar[i].id) }, raw: true })
            for (let j = 0; j < lavhalar.length; j++) {
                if (!arr[muxbirlar[i].id]) {
                    arr[muxbirlar[i].id] = []
                }
                arr[muxbirlar[i].id].push(lavhalar[j])
            }
        }
        const text = await getTop3MuxbirText(arr, Muxbir);
        await ctx.reply(text)
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})

// Get hisobots

bot.on("message", async (ctx, next) => {
    try {
        if (!session[ctx.from.id]) session[ctx.from.id] = {}
        if (session[ctx.from.id]["state"] == "waiting_muxbir_name") {
            const muxbir_name = ctx.message.text
            await ctx.reply("Zo'r! endi muxbirning telegram ID yoki usernameni kiriting!")
            session[ctx.from.id]["user"] = {
                ...session[ctx.from.id]["user"],
                full_name: muxbir_name
            }
            session[ctx.from.id]["state"] = "waiting_user_telegram"
        } else if (session[ctx.from.id]["state"] == "waiting_user_telegram") {
            const newUser = {
                ...session[ctx.from.id]["user"],
                telegram: ctx.message.text
            }
            await Muxbir.create(newUser)
            await ctx.reply("✅ Muxbir muvaffaqiyatli qo'shildi")
            session[ctx.from.id]["state"] = ""
        }
        next()
    } catch (err) {
        console.log(err)
        ctx.reply("Xatolik yuz berdi")
    }
})