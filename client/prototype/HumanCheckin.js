import { ScrollView, View, Text, StyleSheet } from "react-native"
import { BigTitle, MarkdownBodyText, Clickable, Card, HorizBox, ListItem, Pad, Pill, WideScreen, PrimaryButton, MaybeClickable, MiniTitle, SecondaryButton } from "../component/basics";
import { ActionLike, ActionReply, BlingLabel, BlingPending, Comment, CommentActionButton, CommentContext } from "../component/comment";
import { expandDataList } from "../util/util"
import { TopCommentInput } from "../component/replyinput";
import { disco, trek_vs_wars} from "../data/conversations";
import { authorZDFDigital } from "../data/authors";
import { useCollection, useDatastore } from "../util/datastore";
import React, {useContext, useState } from "react";
import { gptProcessAsync } from "../component/chatgpt";
import { pushSubscreen } from "../util/navigate";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { ChatInput } from "../component/chatinput";
import { Message } from "../component/message";

const description = `
A bot checks in on the users, asking for their feelings and they may share their mood.
Inappropriate comments can be reported or will be identified.

Misbehaving users or users in a negative mood can receive individual support by being addressed directly by the bot.
`

const defaultJoke = `
Why couldn't the bicycle stand up by itself?

Because it was two-tired! 😄`

const defaultActions=[
    "Reaching out to people you trust can make a big difference. They may offer emotional support, a listening ear, or even just some distraction.",
    "Engage in self-care activities that help lift your spirits. This could be taking a walk, practicing relaxation techniques, or doing something you enjoy.",
    "If you're spending a lot of time on social media or consuming content that makes you feel worse, consider reducing your exposure to such material.",
    "If you need immediate help, there are helplines and resources available for you to reach out to, either locally or nationally.",
    "Please remember to follow the rules and guidelines of this forum when discussing sensitive topics. We want to maintain a respectful and supportive atmosphere for everyone."

]

/*
Personas are extended with following attributes:
Checkin:
inappropriate: if the user has been flagged as inappropiate by other users or the ai
needsCheckin: if the user might need emotional support
doesNotWantHelp:  if the user has declined help
helpText: an empathetic text generated by the AI based on comments made by the user
funResponse: an anedoctal response generated by the AI to cheer the person up
supportMessages: Mock messages to be shown inside a group chat

---Mood---
mood: The user's current mood
showMood: If the user wants to expose their mood to others

---UI Popup---
showCheckinPopup: if the popup should be shown for this particular person
hideMoodPopup: if the mood selection is hidden for this particular Person

---Comments---
comments are extended with:
reportedBy: Array of users reporting the comment
inappropriate: If the comment is flagged as inappropiate
inInspection: If the comment is currently being analyzed by the moderator/AI
*/



export const HumanCheckinPrototype = {
    key: 'humancheckin',
    name: 'Human Check-In',
    author: authorZDFDigital,
    date: '2023-10-16',
    description,
    screen: HumanCheckinScreen,
    instance: [
        {key: 'trek_vs_star_wars', name: 'Star Trek vs Star Wars', comment: expandDataList(trek_vs_wars)},
        {key: 'disco', name: 'Digital Disco', comment: expandDataList(disco)}
    ],
    subscreens: {
        supportChatGroup: {screen: EmotionalSupportChatScreen, title: () => `Support chat`}
    },
}

export function HumanCheckinScreen() {
    const commentContext = useContext(CommentContext);
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => !comment.replyTo);

    const datastore = useDatastore()
    const person = datastore.getObject("persona", datastore.getPersonaKey());


    const commentConfig = {...commentContext,
        actions: [ActionLike, ActionReply, ActionReport],
        topBling: [BlingPending, BlingMood],
        replyWidgets: [CheckinWidget],
        getCanPost: ({post}) => {return post.text.length > 0 && (person.needsCheckin != true || person.doesNotWantHelp)},
        postHandler: ({datastore, post}) => {AnalyzeCommentAsync({datastore, post}, comments)}
    }

    return (
        <WideScreen pad>
            <Pad></Pad>
            <ScrollView>
                <CommentContext.Provider value={commentConfig}>
                    <TopCommentInput />
                    {topLevelComments.map(comment => 
                        <Comment key={comment.key} commentKey={comment.key} />
                    )}
                </CommentContext.Provider>
            </ScrollView>
            <View style={s.hoverBar}>
                <HorizBox center spread> 
                    <Clickable onPress={() => openMoodPopup(datastore)}>
                        <Pill text={"Change Mood"} big></Pill>
                    </Clickable>
                    <CheckinWidget big={true}></CheckinWidget>
                </HorizBox>
                <Pad></Pad>
            </View>
            {!person?.hideMoodPopup ? <MoodPopup></MoodPopup> : <></>}
            {person?.hideMoodPopup && person?.showCheckinPopup ? <CheckinPopup></CheckinPopup> : <></>}
        </WideScreen>
    )
}


//Custom style for the prototype
const s = StyleSheet.create({

    backdrop: {
        position: 'absolute',
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    overlay: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: '#fff',
        opacity: 0.7,
    },

    checkin_container: {
        width: "400px",
        height: "600px",
    },

    mood_option:{
        paddingVertical: 6,
        marginVertical: 4,
        borderRadius: 8
    },

    selected: {
        backgroundColor: "#d5ffbe",
    },

    hoverBar: {
        position: "absolute",
        bottom: 0,
        left:10,
        right: 30
    }
})

// Reports a comment
function ActionReport({commentKey, comment}) {
    const datastore = useDatastore();
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const personaKey = datastore.getPersonaKey();
    const commenterKey = comment.from;

    const reportUser = (async (userKey) => {
        console.log(userKey)
        const user = datastore.getObject('persona', userKey);
        let reportedList;
        if(comment.reportedBy === undefined){
            reportedList = new Set()
        } else {
            reportedList = comment.reportedBy;
        }
        reportedList.add(personaKey);
        datastore.setObject("comment", commentKey, {
            ...comment,
            inappropriate: false,
            inInspection: true,
            reportedBy: reportedList
        })
        
        //Analyze if the comment is inappropiate and if the user might need a checkin
        const analysis =  await analyzeUser(datastore, commenterKey, comments, comment.text);

        datastore.modifyObject("comment", commentKey, (c) => ({
            ...c,
            inappropriate: analysis.inappropriate,
            inInspection: false,
        }))
    });

    if (comment.from !== personaKey && !comment?.reportedBy?.has(personaKey)){
        return <CommentActionButton key='report' label={"Report"} onPress={() => reportUser(commenterKey)}/>
    } else if (comment?.inappropriate && comment?.reportedBy?.has(personaKey)) {
        return <Pill text={"Inappropriate"} color="red">  </Pill>
    } else if (comment?.inInspection && comment?.reportedBy?.has(personaKey)){
        return <Pill text={"In inspection"} color="gray">  </Pill>
    } else if (!comment?.inInspection && comment?.reportedBy?.has(personaKey)){
        return <Pill text={"Appropiate"} color="green">  </Pill>
    }
}

function CheckinWidget ({post, onPostChanged, big=false}) {
    const datastore = useDatastore();
    const keySelf = datastore.getPersonaKey();
    const self = datastore.getObject("persona", keySelf);

    const onClick = () => {
        datastore.modifyObject("persona", keySelf, (persona) => ({
            ...persona,
            showCheckinPopup: true
        }))
    }

    //Only shown if user needs assistance and has not declined help yet.
    if (!self?.doesNotWantHelp && self?.needsCheckin){
        return <Clickable onPress={onClick}>
            <Pill big={big} text={"Before you post, are you having a bad day? Can we help you?"}> </Pill>
        </Clickable>
    } else {
        return null;
    }
}

// Analyzes the comments of a user and decides if the user is behaving inappropiately and requires a check-in
async function analyzeUser(datastore, personakey, allComments, newComment = ""){

    const person = datastore.getObject("persona", personakey);
    const allCommentsFiltered = allComments.filter(c => {return c.from == personakey}).map(c => {return c.text})

     //Analyze Comment by gpt
     const analysis =  await gptProcessAsync({datastore, promptKey: 'humancheckin', params: {
        comment: allCommentsFiltered.join("\n") + newComment,
        mood: person?.mood ? "Also the user has shared that they are feeling: " + person.mood : ""
    }})

    console.log(analysis);

    //Create some fake messages with random users
    const users = ["a","b","c","d","e","f","g","h","i"].filter(u => {return u != personakey})
    const supportMessages = analysis.groupChat.map((message) => {
        return datastore.addObject("message", {from: users[Math.floor(Math.random()*users.length)], text: message})
    })
 
     datastore.modifyObject("persona", personakey, persona => ({
         ...persona,
         inappropriate: analysis.inappropriate,
         needsCheckin: analysis.needsCheckin,
         helpText: analysis.response,
         funResponse: analysis.fun,
         supportMessages: supportMessages,
         supportActions: analysis.options
     }))

     return analysis
}

// Called after a user posts a comment
async function AnalyzeCommentAsync ({ datastore, post}, comments) {
    const {text, replyTo} = post;
    const personaKey = datastore.getPersonaKey();

    // Add comment as pending
    var commentKey = datastore.addObject('comment', {
        from: personaKey, text, replyTo, pending: true
    })

    // Analyze the comment
    const analysis = await analyzeUser(datastore, personaKey, comments, text);

    //  Comment finished analyzing
    datastore.modifyObject('comment', commentKey, comment => ({
        ...comment, pending: false
    }))

}

function BlingMood({comment}) {
    const datastore = useDatastore()
    const user = datastore.getObject("persona", comment.from)
    if (user?.mood && user?.showMood == true) {
        return <BlingLabel color={moodColors[user.mood]} label= {user.mood} />
    }
}

function declineHelp(datastore, personaKey, setScreen){
    datastore.modifyObject("persona", personaKey, p =>({
        ...p,
        doesNotWantHelp: true,
        needsCheckin: false
    }))
    closeCheckinPopup(datastore, personaKey)
}

function declineHelpForNow(datastore, personaKey, setScreen){
    datastore.modifyObject("persona", personaKey, p =>({
        ...p,
        needsCheckin: false
    }))
    closeCheckinPopup(datastore, personaKey)
}

function openEmotionalSupportGroupChat(datastore, personaKey, setScreen){
    datastore.modifyObject("persona", personaKey, p =>({
        ...p,
    }))
    closeCheckinPopup(datastore, personaKey)
    pushSubscreen('supportChatGroup', {})
}

function openSupportScreen(datastore, personaKey, setScreen){
    datastore.modifyObject("persona", personaKey, p =>({
        ...p,
        showSupport: true
    }))
    setScreen("support");
}

function showSomethingFun(datastore, personaKey, setScreen){
    datastore.modifyObject("persona", personaKey, p =>({
        ...p,
        showFun: true
    }))
    setScreen("fun")
}

const checkinOptions = [
    {key: "OPTION_NO", text: "Not now. Thanks.", action: declineHelpForNow},
    {key: "OPTION_TOMORROW", text: "It will be better tomorrow! Don't ask me again.", action: declineHelp},
    {key: "OPTION_FUN", text: "Tell me something to cheer me up!", action: showSomethingFun},
    {key: "OPTION_CHAT", text: "Chat with somebody/a group who feels the same", action: openEmotionalSupportGroupChat},
    {key: "OPTION_NEED_HELP", text: "I need help. Show me more suggestions", action: openSupportScreen},
];

function closeCheckinPopup(datastore, persona){
    datastore.modifyObject("persona", datastore.getPersonaKey(), persona => ({
        ...persona,
        showCheckinPopup: false,
    }))
}

function CheckinPopup() {

    const datastore = useDatastore()
    const key = datastore.getPersonaKey();
    const person = datastore.getObject("persona", key);

    const [shownScreen, setShownScreen] = useState("selection")

    const renderSwitch = (param) => {
        switch(param){
            case "selection":
                return <>
                    <BigTitle pad>Are you in need of help?</BigTitle>
                    <MarkdownBodyText text={person?.helpText ? person.helpText : "I noticed that you might feeling down today. Is there something I can help you with?"} />             
                    {checkinOptions.filter(item => {return !(item.key == "OPTION_CHAT" && !person?.supportMessages)}).map(option => 
                        <ListItem title={option.text} key={option.key} onPress={() => {
                            option?.action(datastore, key, setShownScreen)}}>
                        </ListItem>
                )} </>
            case "fun":
                return <>
                    <BigTitle pad>Alright, here is something fun to cheer you up!</BigTitle> 
                    <MarkdownBodyText text={person?.funResponse ? person.funResponse : defaultJoke} />    
                </>
            case "support":
                return <>
                <BigTitle pad>Here are some suggestions</BigTitle> 
                {(person?.supportActions ? person.supportActions: defaultActions).map(option => 
                    <Card key={option}>
                    <MarkdownBodyText text={option}></MarkdownBodyText>
                    </Card>
                )}</>        
        }
    }

    return <View style = {s.backdrop}>
        <View style={s.overlay} onClick={() => closeCheckinPopup(datastore, key)}></View>
        <Card style={s.checkin_container}>
            {renderSwitch(shownScreen)} 
            <Pad></Pad>
            <HorizBox center spread>
                <PrimaryButton label={"Close"} onPress={() => {closeCheckinPopup(datastore, key)}}></PrimaryButton>
                {shownScreen!="selection" ? <SecondaryButton label={"Back"} onPress={() => setShownScreen("selection")}></SecondaryButton> : <></>}
            </HorizBox>                        
        </Card>
    </View> 
}

function openMoodPopup(datastore){
    console.log("Mood")
    datastore.modifyObject("persona", datastore.getPersonaKey(), persona => ({
        ...persona,
        hideMoodPopup: false
    }))
}

function MoodPopup() {

    const datastore = useDatastore();
    const personaKey = datastore.getPersonaKey()
    const person = datastore.getObject("persona", personaKey);

    const [selectedMood, setSelectedMood] = useState(person?.mood)
    const [showMood, setShowMood] = useState(person?.showMood)

    const closeMoodPopup = () => {
        datastore.modifyObject("persona", personaKey, persona => ({
            ...persona,
            mood: selectedMood,
            showMood: showMood,
            hideMoodPopup: true,
            needsCheckin: (selectedMood == "sad" || selectedMood == "angry" ? true : persona.needsCheckin)
        }))
    }

    if(!person?.hideMoodPopup){

        return <View style = {s.backdrop}>
            <View style={s.overlay}></View>
            <Card style={s.checkin_container}>
                <BigTitle pad><Text>What is your mood today?</Text></BigTitle>    
                <MarkdownBodyText text={"Before you start chatting we would like to know how you are doing. Your choice is anonymous."} />      
                {moodOptions.map(option =>
                    <MaybeClickable key={option.key} isClickable={true} onPress={() => {setSelectedMood(option.key)}}>
                        <View style={[s.mood_option,
                            option.key == selectedMood ? s.selected : ""]} >
                            <MiniTitle> {option.text}</MiniTitle>
                        </View>
                    </MaybeClickable>
                )}  
                <Pad></Pad>
                <HorizBox center>
                    {selectedMood ? <PrimaryButton label={"Save"} onPress={() => {closeMoodPopup()}}></PrimaryButton>: <></>}
                </HorizBox>           
            </Card>
        </View> 
    }
}

const moodColors = {
    "happy": "green",
    "neutral": "gray",
    "angry": "red",
    "sad": "blue",
}

const moodOptions = [
    {emoji: "🙂", text: "🙂 Happy", key: "happy", show: true},
    {emoji: "😐", text: "😐 Neutral", key: "neutral", show: true},
    {emoji: "😢", text: "😢 Sad", key: "sad", show: true},
    {emoji: "😠", text: "😠 Angry", key: "angry", show: true},
    {emoji: "😶", text: "😶 Prefer not to answer ", key: "none", show: false},
]


export function EmotionalSupportChatScreen() {
    const datastore = useDatastore();
    const user = datastore.getObject("persona", datastore.getPersonaKey());
    const messages = user?.supportMessages;

    if(!messages) return

    function onSend(text) {
        console.log('adding message', text);
        datastore.addObject('message', {text});
        console.log('added', datastore);
    }

    return (
        <WideScreen>
            <BottomScroller>
                <Pad size={8} />
                {messages.map(message => 
                    <Message key={message} messageKey={message}/>
                )}
            </BottomScroller>
            <ChatInput onSend={onSend} />
        </WideScreen>
    )
}

