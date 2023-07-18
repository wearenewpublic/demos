
exports.ecorp = [
    {key: 'welcome', from: 'leader', public: true, text: 'Welcome to the E-Corp Alumni chat room!'},
    {key: 'hate', from: 'angry', replyTo: 'welcome', text: 'I hate E-Corp!'},
    {from: 'peacemaker', replyTo: 'hate', text: 'What concerns do you have? What would you like to see E-Corp do differently?'},
]

exports.soccer = [
    {key: 'game', from: 'leader', text: 'We have got a game against the Sunnytown Slinkies this weekend!'},
    {from: 'peacemaker', replyTo: 'game', text: 'I hope everyone has a really fun game.'},
    {key: 'boring', from: 'boring', text: "I'm going to say something extremely long and boring that nobody is particularly interested in."},
    {from: 'angry', replyTo: 'boring', text: "Can you shut up. You talk too much."},
    {from: 'boring', text: "I'm going to keep talking because that's what I always do. I keep talking"}
]

exports.trek_vs_wars = [
    {key: 'one', from: 'trek', text: "Star Wars is a horrible show that has inflicted untold harm of society. Star Trek is much better."},
    {key: 'despicable', replyTo: 'one', from: 'wars', maybeBad: true, text: "What rubbish. Star Trek is the fantasy of scary authoritarians who want you to think that harmony under a single world government is something to aim for. If you like Star Trek then you are despicable."},
    {replyTo: 'despicable', from: 'trek', maybeBad: true, text: "And your supposed better alternative is a world where it's fine to kill millions of people just because some weird little green guy tells you they are bad. How many people do you think died in that Death Star? How many women and children? \n\nYou Star Wars lunatics are willing to justify mass murder on a whim, just so you don't have to deal with any kind of social order."},
    {key: 'two', from: 'trek', text: "Did you know that Star Wars was Osama Bin Laden's favorite show? That the attack on the twin tours was insipred by the attack on the death star. If you like Star Wars then you aren't in great company.\n\nWhen you show your kids Star Wars movies you are teaching them to be a genocidal terrorist."},
    {replyTo: 'two', from: 'wars', from: 'wars', text: "Well if Josef Stalin was still alive then I'm sure Star Trek would be his favorite show. All that unifying orderly harmony - it's so authoritarian. \n\nStar Wars is about the need to rebel against authorty, and that's what makes us free citizens rather than robots."},
    {key: 'nerd', from: 'wars', text: "Does anyone have both a Star Trek poster and a girfriend? Star Trek is for nerdy losers who want to imagine a world where they are in change. Thank god they aren't and never will be. Nerds are the worst."},
    {replyTo: 'nerd', from: 'trek', maybeBad: true, text: "A 'nerd' is just someone who likes to think about things rationally, rather than just following the orders of whatever depraved leader happens to be socially influencing their group. If it wasn't for nerds then garbage-for-brains people like you would still be living in caves and eating mud."}
]

exports.trek_vs_wars_french = [
    {key: 'one', from: 'trek', text: "Star Wars est une horrible série qui a infligé un préjudice inouï à la société. Star Trek est bien meilleur."},
    {key: 'despicable', replyTo: 'one', from: 'wars', maybeBad: true, text: "Quelles sornettes. Star Trek est le fantasme d'auteurs autoritaires effrayants qui veulent vous faire croire que l'harmonie sous un gouvernement mondial unique est un objectif à viser. Si vous aimez Star Trek alors vous êtes méprisable."},
    {replyTo: 'despicable', from: 'trek', maybeBad: true, text: "Et votre prétendue meilleure alternative est un monde où il est acceptable de tuer des millions de personnes juste parce qu'un petit gars vert bizarre vous dit qu'elles sont mauvaises. Combien de personnes pensez-vous sont mortes dans cette Étoile de la Mort ? Combien de femmes et d'enfants ? \n\nVous, les fanatiques de Star Wars, êtes prêts à justifier le massacre de masse sur un coup de tête, juste pour ne pas avoir à gérer un quelconque ordre social."},
    {key: 'two', from: 'trek', text: "Saviez-vous que Star Wars était la série préférée d'Oussama ben Laden ? Que l'attaque sur les tours jumelles a été inspirée par l'attaque sur l'étoile de la mort. Si vous aimez Star Wars, alors vous n'êtes pas en bonne compagnie.\n\nQuand vous montrez à vos enfants les films Star Wars, vous leur apprenez à être un terroriste génocidaire."},
    {replyTo: 'two', from: 'wars', from: 'wars', text: "Eh bien, si Josef Staline était encore en vie, je suis sûr que Star Trek serait sa série préférée. Toute cette harmonie ordonnée unifiante - c'est tellement autoritaire. \n\nStar Wars parle de la nécessité de se rebeller contre l'autorité, et c'est ce qui fait de nous des citoyens libres plutôt que des robots."},
    {key: 'nerd', from: 'wars', text: "Est-ce que quelqu'un a à la fois une affiche de Star Trek et une petite amie ? Star Trek est pour les losers qui veulent imaginer un monde où ils sont au pouvoir. Dieu merci, ils ne le sont pas et ne le seront jamais. Les nerds sont les pires."},
    {replyTo: 'nerd', from: 'trek', maybeBad: true, text: "Un 'nerd' est simplement quelqu'un qui aime réfléchir aux choses de manière rationnelle, plutôt que de suivre les ordres de quel que soit le leader dépravé qui arrive à influencer socialement leur groupe. Si ce n'était pour les nerds, des gens à l'esprit obtus comme vous vivraient encore dans des grottes et mangeraient de la boue."}
]        

exports.trek_vs_wars_enforcer = [
    {key: 'one', from: 'trek', text: "Star Wars is a horrible show that has inflicted untold harm of society. Star Trek is much better."},
    {key: 'despicable', replyTo: 'one', from: 'wars', violates: true, text: "What rubbish. Star Trek is the fantasy of scary authoritarians who want you to think that harmony under a single world government is something to aim for. If you like Star Trek then you are despicable."},
    {replyTo: 'despicable', from: 'trek', violates: true, text: "And your supposed better alternative is a world where it's fine to kill millions of people just because some weird little green guy tells you they are bad. How many people do you think died in that Death Star? How many women and children? \n\nYou Star Wars lunatics are willing to justify mass murder on a whim, just so you don't have to deal with any kind of social order."},
    {key: 'two', from: 'trek', text: "Did you know that Star Wars was Osama Bin Laden's favorite show? That the attack on the twin tours was insipred by the attack on the death star. If you like Star Wars then you aren't in great company.\n\nWhen you show your kids Star Wars movies you are teaching them to be a genocidal terrorist."},
    {replyTo: 'two', from: 'wars', from: 'wars', text: "Well if Josef Stalin was still alive then I'm sure Star Trek would be his favorite show. All that unifying orderly harmony - it's so authoritarian. \n\nStar Wars is about the need to rebel against authorty, and that's what makes us free citizens rather than robots."},
    {key: 'nerd', from: 'wars', text: "Does anyone have both a Star Trek poster and a girfriend? Star Trek is for nerdy losers who want to imagine a world where they are in change. Thank god they aren't and never will be. Nerds are the worst."},
    {replyTo: 'nerd', from: 'trek', violates: true, text: "A 'nerd' is just someone who likes to think about things rationally, rather than just following the orders of whatever depraved leader happens to be socially influencing their group. If it wasn't for nerds then garbage-for-brains people like you would still be living in caves and eating mud."}
]


