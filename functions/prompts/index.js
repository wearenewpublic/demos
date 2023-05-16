const { robo_mediator_prompt } = require("./mediator");
const { unproductive_conflict_prompt } = require("./unproductive-conflict");

exports.prompts = {
    robomediator: robo_mediator_prompt,
    unproductive: unproductive_conflict_prompt,
}

