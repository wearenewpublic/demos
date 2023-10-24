exports.ecorp = [
    {key: 'welcome', from: 'i', public: true, text: 'Welcome to the E-Corp Alumni chat room!'},
    {key: 'hate', from: 'a', replyTo: 'welcome', text: 'I hate E-Corp!'},
    {from: 'f', replyTo: 'hate', text: 'What concerns do you have? What would you like to see E-Corp do differently?'},
]

exports.soccer = [
    {key: 'game', from: 'i', text: 'We have got a game against the Sunnytown Slinkies this weekend!'},
    {from: 'f', replyTo: 'game', text: 'I hope everyone has a really fun game.'},
    {key: 'b', from: 'b', text: "I'm going to say something extremely long and boring that nobody is particularly interested in."},
    {from: 'a', replyTo: 'b', text: "Can you shut up. You talk too much."},
    {from: 'b', text: "I'm going to keep talking because that's what I always do. I keep talking"}
]

exports.trek_vs_wars = [
    {key: 'one', from: 'c', text: "Star Wars is a horrible show that has inflicted untold harm of society. Star Trek is much better."},
    {key: 'despicable', replyTo: 'one', from: 'b', maybeBad: false, text: "What rubbish. Star Trek is the fantasy of scary authoritarians who want you to think that harmony under a single world government is something to aim for. If you like Star Trek then you are despicable."},
    {replyTo: 'despicable', from: 'c', maybeBad: true, text: "And your supposed better alternative is a world where it's fine to kill millions of people just because some weird little green guy tells you they are bad. How many people do you think died in that Death Star? How many women and children? \n\nYou Star Wars lunatics are willing to justify mass murder on a whim, just so you don't have to deal with any kind of social order."},
    {key: 'two', from: 'c', text: "Did you know that Star Wars was Osama Bin Laden's favorite show? That the attack on the twin tours was insipred by the attack on the death star. If you like Star Wars then you aren't in great company.\n\nWhen you show your kids Star Wars movies you are teaching them to be a genocidal terrorist."},
    {replyTo: 'two', from: 'b', text: "Well if Josef Stalin was still alive then I'm sure Star Trek would be his favorite show. All that unifying orderly harmony - it's so authoritarian. \n\nStar Wars is about the need to rebel against authorty, and that's what makes us free citizens rather than robots."},
    {key: 'nerd', from: 'b', text: "Does anyone have both a Star Trek poster and a girfriend? Star Trek is for nerdy losers who want to imagine a world where they are in change. Thank god they aren't and never will be. Nerds are the worst."},
    {replyTo: 'nerd', from: 'c', maybeBad: true, text: "A 'nerd' is just someone who likes to think about things rationally, rather than just following the orders of whatever depraved leader happens to be socially influencing their group. If it wasn't for nerds then garbage-for-brains people like you would still be living in caves and eating mud."}
]

exports.trek_vs_wars_enforcer = [
    {key: 'one', from: 'c', text: "Star Wars is a horrible show that has inflicted untold harm of society. Star Trek is much better."},
    {key: 'despicable', replyTo: 'one', from: 'b', violates: true, text: "What rubbish. Star Trek is the fantasy of scary authoritarians who want you to think that harmony under a single world government is something to aim for. If you like Star Trek then you are despicable."},
    {replyTo: 'despicable', from: 'c', violates: true, text: "And your supposed better alternative is a world where it's fine to kill millions of people just because some weird little green guy tells you they are bad. How many people do you think died in that Death Star? How many women and children? \n\nYou Star Wars lunatics are willing to justify mass murder on a whim, just so you don't have to deal with any kind of social order."},
    {key: 'two', from: 'c', text: "Did you know that Star Wars was Osama Bin Laden's favorite show? That the attack on the twin tours was insipred by the attack on the death star. If you like Star Wars then you aren't in great company.\n\nWhen you show your kids Star Wars movies you are teaching them to be a genocidal terrorist."},
    {replyTo: 'two', from: 'b', from: 'b', text: "Well if Josef Stalin was still alive then I'm sure Star Trek would be his favorite show. All that unifying orderly harmony - it's so authoritarian. \n\nStar Wars is about the need to rebel against authorty, and that's what makes us free citizens rather than robots."},
    {key: 'nerd', from: 'b', text: "Does anyone have both a Star Trek poster and a girfriend? Star Trek is for nerdy losers who want to imagine a world where they are in change. Thank god they aren't and never will be. Nerds are the worst."},
    {replyTo: 'nerd', from: 'c', violates: true, text: "A 'nerd' is just someone who likes to think about things rationally, rather than just following the orders of whatever depraved leader happens to be socially influencing their group. If it wasn't for nerds then garbage-for-brains people like you would still be living in caves and eating mud."}
]

exports.trek_vs_wars_constructive = [
    { key: 'trek', from: 'c', text: "I'm a Star Trek girl through and through. Star Wars never did it for me." },
    { from: 'robo', replyTo: 'trek', replyToPersona: 'c', thanks: true, text: "Thanks for commenting! Have this cookie: 🍪"},
    { key: 'same', replyTo: 'trek', from: 'g', text: "Same!" },
    { from: 'robo', replyTo: 'same', replyToPersona: 'g', thanks: true, text: "*hands you a cookie* 🍪"},
    { key: 'never', from: 'b', text: "If I had to choose, I would pick Star Wars, but only because I've never seen Star Trek." },
    { from: 'robo', replyTo: 'never', replyToPersona: 'b', thanks: true, text: "Here, have this cookie as a symbolic thank-you: 🍪"},
    { key: 'how', replyTo: 'never', from: 'c', text: "Oh, how come?" },
    { from: 'robo', replyTo: 'how', replyToPersona: 'c', thanks: true, text: "This cookie is just for you: 🍪"},
    { key: 'young', replyTo: 'how', from: 'b', text: "I guess I'm just too young. I know there were re-runs on TV when I was a kid, but the show had already ended at that point. Never caught my interest." },
    { from: 'robo', replyTo: 'young', replyToPersona: 'b', thanks: true, text: "This is fresh out of the oven: 🍪 Enjoy!"},
    { key: 'recommend', replyTo: 'young', from: 'c', text: "Ah, that makes sense. It looks a little dated now but I'd still recommend it." },
    { from: 'robo', replyTo: 'recommend', replyToPersona: 'c', thanks: true, text: "I made this cookie just for you, it's still warm! 🍪"},
    { key: 'relevant', from: 'e', text: "I prefer Star Wars. Star Trek feels too cheesy. But obviously they must've done something right, otherwise it wouldn't be one of the most popular sci-fi shows of all time. It's just not for me." },
    { from: 'robo', replyTo: 'relevant', replyToPersona: 'e', thanks: true, text: "You deserve a cookie for that answer! 🍪"},
]

exports.disco = [
    {key: 'party', from: 'i', tone: "neutral", text: 'There is a party in Cakewalk County next weekend!'},
    {from: 'f', replyTo: 'party', tone: "neutral", text: 'That sounds like a lot of fun.'},
    {key: 'long', from: 'b', tone: "neutral", text: "I'm going to share an extremely long and boring rant about the origin of the word 'disco' that nobody asked for. Here I go. I'm still not done. There is so much to say and I won't stop until everyone is sick of me."},
    {from: 'b', tone: "neutral", text: "I just thought of another nerdy fun fact about the history of dance music and the culture surrounding it. I'm sure you would love to hear it. But even if you don't, I'll share it anyway..."}
]
