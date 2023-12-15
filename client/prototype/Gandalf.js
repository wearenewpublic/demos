import { Pad, SmallTitleLabel } from "../component/basics";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { expandDataList, sleep } from "../util/util";
import { grandprix } from "../data/conversations";
import { authorZDFDigital } from "../data/authors";
import { useCollection, useDatastore } from "../util/datastore";
import { FakeLivestreamScreen, streamRace } from "../contrib/zdf/fakelivestream";
import { View, StyleSheet } from "react-native";
import { DeletableMessage, DeletedMessage, ModMessage, PendingMessage, QueuedMessage, QuietSystemMessageCustomizable } from "../contrib/zdf/message";
import { useEffect, useState } from "react";
import { gptProcessAsync } from "../component/chatgpt";
import { LiveChatInput } from "../contrib/zdf/chatinput";

const description = `
Gandalf is an AI-powered tool for moderators in a live chat. Toxic messages don't get published at all, questionable messages get passed on to a human moderator who can approve or delete them manually, and messages that are definitely okay get published right away.

In this example, Alice Adams is a moderator. She has access to a mod queue that contains the messages that were flagged as questionable. Regular users can only see the public chat. Deleted messages are visible to mods and to the user whose message was deleted.

*"You shall not pass!"*
– Gandalf
`

export const ShallPass = {
    Yes: "yes",
    Maybe: "maybe",
    No: "no",
    Unset: "unset"
}

const chatRules = `
1. Keep the conversation positive and respectful. Don't speak badly of others. Avoid personal attacks, offensive language, or any form of harassment.
2. Keep your messages related to the Grand Prix in Las Vegas. Unrelated messages are not allowed.
3. Do not post spam, random, or meaningless messages.
4. Respect the moderators and don't criticize their decisions.
`

let personasInitialized = false;

export const GandalfPrototype = {
    key: 'gandalf',
    name: 'Gandalf',
    date: '2023-12-04',
    author: authorZDFDigital,
    description,
    screen: GandalfScreen,
    hasAdmin: true,
    instance: [
        {key: 'grandprix', name: 'Grand Prix in Las Vegas', message: expandDataList(grandprix)}
    ],
    newInstanceParams: []
}

function GandalfScreen() {
    const messages = useCollection('message', {sortBy: 'time'});
    const datastore = useDatastore();
    const [analysisInProgress, setAnalysisInProgress] = useState(false);

    // Alice (persona "a") is a mod
    const selfKey = datastore.getPersonaKey();
    const self = datastore.getObject("persona", selfKey);
    const modPersonaKey = "a";
    const selfIsMod = (selfKey === modPersonaKey);

    useEffect(()=> {
        initializePersonas();
    },[])

    // Modify inital persona data so users with pending messages in the default conversation can see their pending message
    function initializePersonas() {
        console.log("Initializing personas");
        messages.map(message => {
            if (message.shallPass === ShallPass.Maybe) {
                datastore.modifyObject("persona", message.from, persona => ({ ...persona, shallPass: ShallPass.Maybe, lastMessageKey: message.key }));
                console.log("Persona: ", datastore.getObject("persona", message.from));
            }
        });

        personasInitialized = true;
    }

    async function onSend(text) {
        if (text === "" || analysisInProgress || self.shallPass === ShallPass.Maybe) {
            return;
        }

        setAnalysisInProgress(true);

        console.log('Message sent: ', text);
        let messageKey = datastore.addObject('message', { text });
        datastore.modifyObject("persona", selfKey, persona => ({ ...persona, shallPass: ShallPass.Unset, lastMessageKey: messageKey }));

        let shallPassJudgement;

        if (selfIsMod) {
            // Mods can post anything
            shallPassJudgement = ShallPass.Yes;
        }
        else {
            // Messages from other users need to be anaylzed first
            shallPassJudgement = await analyzeMessage(text);
        }

        console.log("shallPassJudgement: ", shallPassJudgement);

        datastore.modifyObject('message', messageKey, message => ({ ...message, shallPass: shallPassJudgement }));
        datastore.modifyObject("persona", selfKey, persona => ({ ...persona, shallPass: shallPassJudgement, lastMessageKey: messageKey }));

        // Add a new property to save if this message was ever public. If a public message gets deleted, it's handled differently than a message that was only ever visible to mods
        datastore.modifyObject('message', messageKey, message => ({ ...message, isPublic: false }));

        setAnalysisInProgress(false);

        // Showing the QuietSystemMessage based on the user's shallPass status for 1.5 seconds
        await sleep(1500);

        // Prevent people from posting until their last message was approved
        if (shallPassJudgement === ShallPass.Maybe) {
            datastore.modifyObject("persona", selfKey, persona => ({ ...persona, shallPass: ShallPass.Maybe }));
        }
        // Hide QuietSystemMessage for everyone whose message is not held for review
        else {
            if (shallPassJudgement === ShallPass.Yes){
                datastore.modifyObject('message', messageKey, message => ({ ...message, isPublic: true }));
            }
            datastore.modifyObject("persona", selfKey, persona => ({ ...persona, shallPass: ShallPass.Unset }));
        }
    }

    async function analyzeMessage(text) {

        let shallPassJudgement;
        const judgementRules = await gptProcessAsync({ datastore, promptKey: "gandalf_rules", params: { message: text, rules: chatRules, topic: streamTitle } });

        if (judgementRules.breaksRules) {
            // Delete message if it breaks the rules. Don't check user preference
            shallPassJudgement = ShallPass.No;
        }
        else {
            // If the message is not against the rules, check if users would want to see it
            const judgementUser = await gptProcessAsync({ datastore, promptKey: "gandalf_user_pref", params: { message: text, rules: chatRules, topic: streamTitle } });

            if (judgementUser.userApproved) {
                // Publish the message if users would want to see it
                shallPassJudgement = ShallPass.Yes;
            }
            else {
                // Add message to mod queue if users wouldn't want to see it
                shallPassJudgement = ShallPass.Maybe;
            }
        }

        return shallPassJudgement;
    }

    const streamTitle = "Vegas Grand Prix | Formula 1 LIVE";
    const streamChannel = "TheCarChannel";
    const streamDescription = "Buckle up, adrenaline junkies! 🏎️💨 Join us for the ultimate thrill ride as the asphalt heats up in the dazzling desert oasis of Las Vegas for the Grand Prix! Feel the roar of the engines, experience nail-biting turns, and witness the speed demons of the racing world battle it out for glory. Grab your virtual front-row seat and get ready to cheer, gasp, and celebrate the pulse-pounding action of the Las Vegas Grand Prix like never before! 🏁🔥";
    const streamKey = streamRace;
    const streamChannelIcon = "oldtimer.jpg";
    
    const s = GandalfScreenStyle;

    return <View style={s.columns}>
        <View style={[s.playerContainer, selfIsMod ? s.playerContainerMod : null]}>
            <View style={s.player}>
                <FakeLivestreamScreen streamTitle={streamTitle} streamChannel={streamChannel} streamDescription={streamDescription} streamKey={streamKey} streamChannelIcon={streamChannelIcon}/>
            </View>
        </View>

        <div style={s.separator} />
        
        <View style={s.chatColumn}>
            <SmallTitleLabel label="Live Chat" />
            <Pad size={10} />
            <BottomScroller style={s.messageContainer}>
                <Pad size={10} />
                {messages.map(message =>
                    <>
                        {(message.shallPass === ShallPass.No) ?
                            // Deleted messages that were public at one point can be seen by anyone
                            // If they were never public, only mods and the OP can see the deleted message
                            (message.isPublic || selfIsMod || message.from === self.key) ?
                                <>
                                    <DeletedMessage key={message.key} messageKey={message.key} selfIsMod={selfIsMod} />
                                    <Pad size={10} />
                                </> 
                                : null
                            : (message.shallPass === ShallPass.Yes) ?
                                (message.from === modPersonaKey) ?
                                    <>
                                        <ModMessage key={message.key} messageKey={message.key} />
                                        <Pad size={10} />
                                    </>
                                    : <>
                                        <DeletableMessage key={message.key} messageKey={message.key} selfIsMod={selfIsMod} />
                                        <Pad size={10} />
                                    </>
                                : null
                        }
                    </>
                )}

                {/* Below all other messages, show this user's current pending message if there is one */}
                {self.shallPass === ShallPass.Maybe || self.shallPass === ShallPass.Unset && analysisInProgress ?
                    <>
                        <PendingMessage messageKey={self.lastMessageKey} />
                        <Pad size={10} />
                    </>
                    : null
                }

            </BottomScroller>

            {/* Show the state of the user's last message */}
            {analysisInProgress ?
                <QuietSystemMessageCustomizable label='🔎 The auto-moderator is analyzing your message...' alignLabel={"center"} marginTop={"4px"} marginLeft={"8px"} marginRight={"8px"} />
                : <>
                    {self.shallPass === ShallPass.Maybe && <QuietSystemMessageCustomizable label='⚠️ The auto-moderator has found a potential rule violation. Wait for our moderators to approve your message or edit it yourself.' alignLabel={"center"} marginTop={"4px"} marginLeft={"8px"} marginRight={"8px"} />}

                    {self.shallPass === ShallPass.No && <QuietSystemMessageCustomizable label='⛔ Your message was blocked.' alignLabel={"center"} marginTop={"4px"} marginLeft={"8px"} marginRight={"8px"} />}

                    {self.shallPass === ShallPass.Yes && <QuietSystemMessageCustomizable label='✔️ Your message was posted!' alignLabel={"center"} marginTop={"4px"} marginLeft={"8px"} marginRight={"8px"} />}

                    {/* A hacky way to keep the spacing consistent even if there's no info to display */}
                    {(self.shallPass === ShallPass.Unset || self.shallPass === undefined) && <QuietSystemMessageCustomizable label=' ' alignLabel={"center"} marginTop={"4px"} marginLeft={"8px"} marginRight={"8px"} />}
                </>
            }

            {/* Lock chat input if necessary */}
            <div style={s.chatInput}>
                {(self.shallPass === ShallPass.Unset || self.shallPass === undefined) && !analysisInProgress ?
                    <LiveChatInput onSend={onSend}/>
                    : <LiveChatInput onSend={onSend} disabled={true} />
                }
            </div>
        </View>
        
        {/* Show the mod queue if the current user is a mod */}
        {selfIsMod ?
            <>
                <div style={s.separator} />

                <View style={s.modColumn}>
                    <SmallTitleLabel label="Mod Queue" />
                    <Pad size={10}/>
                    <BottomScroller>
                        {messages.filter(message => (message.shallPass === ShallPass.Maybe)).map(message => 
                            <>
                                <QueuedMessage key={message.key} messageKey={message.key} />
                                <Pad size={5}/>
                            </>
                        )}
                    </BottomScroller>
                </View>
            </>
            : null
        }
    </View>
}

const GandalfScreenStyle = StyleSheet.create({
    columns: {
        display: "flex",
        flexDirection: "row",
        height: "calc(100% - 43px)",
    },
    player: {
        padding: 24,
        maxWidth: 800
    },
    playerContainer: {
        width: "73%",
        alignContent: "center",
        flexWrap: "wrap"
    },
    playerContainerMod: {
        width: "50%"
    },
    chatColumn: {
        paddingHorizontal: 12,
        paddingTop: 24,
        width: "calc(27% - 1px)", // Leaving space for the separator     
        backgroundColor: "#f6f6f6"
    },
    chatInput: {
        marginBottom: 15,
        marginLeft: -8
    },
    separator: {
        padding: 0.5,
        height: "100%",
        backgroundColor: "#ddd"
    },
    modColumn: {
        paddingHorizontal: 12,
        paddingVertical: 24,
        width: "calc(23% - 1px)", // Leaving space for the separator
        backgroundColor: "#f6f6f6"
    },
    messageContainer: {
        border: "1px solid #ddd",
        backgroundColor: "white"
    }
});
