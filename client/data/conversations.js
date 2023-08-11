
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


