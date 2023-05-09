
exports.ecorp = [
    {key: 'welcome', from: 'leader', text: 'Welcome to the E-Corp Alumni chat room!'},
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