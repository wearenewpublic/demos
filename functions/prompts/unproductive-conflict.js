exports.unproductive_conflict_prompt = `
I want you to look at a message and say whether this message seems to be causing an unproductive conflict. This might be because it is angry, because it is implying that the other person has bad intent, because it is accusing the other person of having unacceptable beliefs, or otherwise creating conflict.

Please think step by step and give an explanation for your answer, then end your response with a single line in JSON format. If the message is creating unproductive conflict then you should end with {"judgement": true} otherwise end with {"judgement": false}.
`
