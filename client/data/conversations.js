
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

exports.abortion_mediated = [
    {from: "left", text: "Abortion is a fundamental human right that should never be taken away."},
    {from: "right", text: "That's ridiculous. You just enjoy killing babies."},
    {from: "peacemaker", text: "Let's try to keep the discussion civil. Name-calling won't get us anywhere."},
    {from: "left", text: "I don't enjoy killing babies. Abortion is a difficult decision that a woman should be able to make for herself."},
    {from: "right", text: "It's not just about the woman. It's about the life of the unborn child."},
    {from: "peacemaker", text: "That's a valid point. But we need to acknowledge that the woman's life is also important."},
    {from: "left", text: "Exactly. Forcing a woman to carry a pregnancy to term can have serious consequences for her physical and mental health."},
    {from: "right", text: "But what about the sanctity of life? Every life is precious and should be protected."},
    {from: "peacemaker", text: "I think we can all agree that life is precious. But we need to find a way to balance the rights of the woman and the rights of the unborn child."},
    {from: "left", text: "That's why we need to ensure that safe and legal abortion services are available to all women."},
    {from: "right", text: "But we also need to promote alternatives to abortion, like adoption."},
    {from: "peacemaker", text: "Both of those are valid points. We need to provide women with comprehensive reproductive health care and support all options."},
    {from: "left", text: "Agreed. And we also need to address the root causes of unplanned pregnancies, like lack of access to birth control and comprehensive sex education."},
    {from: "right", text: "I can see your point. We need to support families and promote a culture of life."},
    {from: "peacemaker", text: "It's good that we can find common ground. Let's continue this conversation with respect and understanding."}
]

exports.abortion = [
    {from: "left", text: "Abortion is a fundamental human right. Women should be able to make their own choices."},
    {from: "right", text: "No, that's not true. Abortion is murder. It's taking a human life."},
    {from: "left", text: "It's not murder. It's a woman's right to decide what to do with her own body."},
    {from: "right", text: "The unborn child is a separate life. It's not just the woman's body."},
    {from: "left", text: "It's still the woman's decision. No one else should be able to make that choice for her."},
    {from: "right", text: "But what about the unborn child's right to life? Don't they deserve protection too?"},
    {from: "left", text: "Of course they do, but the woman's right to choose should take priority."},
    {from: "right", text: "I disagree. We need to protect innocent life, even if it means limiting a woman's choice."},
    {from: "left", text: "You're just trying to control women's bodies."},
    {from: "right", text: "No, I'm trying to protect the unborn child. You're just using the idea of choice to justify killing."},
    {from: "left", text: "I can't believe you don't see this as a human right issue. You're denying women basic rights."},
    {from: "right", text: "And I can't believe you're okay with taking a human life."},
]

