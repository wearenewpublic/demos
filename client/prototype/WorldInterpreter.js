import { StyleSheet, View } from "react-native";
import { Pad, ScrollableScreen, SmallTitleLabel } from "../component/basics"
import { ActionReply, CommentContext } from "../component/comment";
import { TranslatedComments } from "../contrib/zdf/comment";
import { authorZDFDigital } from "../data/authors";
import { useCollection, useDatastore } from "../util/datastore";
import { expandDataList, sleep } from "../util/util";
import { gptProcessAsync } from "../component/chatgpt";
import React, { useContext } from "react";
import { MediaLibraryPost, videoWatercolor } from "../contrib/zdf/medialibrary";
import { DropDownSelector } from "../newcomponent/button";
import { watercolor_russia } from "../data/threaded";

const description = `
In this prototype, we are exploring the idea of using AI to make comments more accessible and easier to understand by translating them and providing further explanations. While translating comments into foreign languages (English, French, German) is a part of this, the prototype also goes beyond that. There are several other options ranging from useful to entertaining:

- Simplify the comment and break it down into a shorter, more concise version

- Explain the comment in the vein of "explain like I'm 5"

- Turn the comment into a poem

- Convert the comment into emojis

- Rewrite the comment in a style similar to how Gen Z or younger Millennials talk online

- Rewrite the comment in a sophisticated, old-fashioned style

- Convert the comment into runes

Additionally, the option "Explain Words" (working title) will search for any phrases that might need additional context, such as brand names, names of famous people, cultural references, memes, slang, abbreviations, etc.
`

export const WorldInterpreterPrototype = {
    key: 'worldinterpreter',
    name: 'World Interpreter',
    author: authorZDFDigital,
    date: '2023-11-08',
    description,
    screen: WorldInterpreterScreen,
    instance: [
        { key: 'watercolor', name: 'Watercolor Controversy', comment: expandDataList(watercolor_russia) },
    ]
}

const mediaInfo = {
    primaryVideoTitle: "Watercolors Against Winter Blues",
    videoSummary: "For many people, the winter months are gray and dreary - but not for illustrator Christine Schuster. She creates colorful worlds with brushes and watercolors.",
    videoLength: "3 min",
    videoDate: "02/18/2023",
    videoKey: videoWatercolor,
};

let bulkTranslationCanceled = false;

export function WorldInterpreterScreen() {
    const commentContext = useContext(CommentContext);
    const datastore = useDatastore();

    const comments = useCollection('comment', { sortBy: 'time', reverse: true });

    const commentConfig = {...commentContext,
        actions: [ActionReply, ActionTranslate, ActionInterpret]
    }

    const s = WorldInterpreterStyle;

    function selectLanguage(key) {
        switch (key) {
            case "original":
                // Hide translation and cancel bulk process
                bulkTranslationCanceled = true;
                window.stop(); // This doesn't stop pending ChatGPT calls, but it prevents the result from being displayed
                comments.forEach(comment => {
                    datastore.modifyObject('comment', comment.key, comment => ({ ...comment, translation: undefined, annotatedText: undefined, translationPending: false }));
                });
                break;
            case "english":
                bulkTranslationCanceled = false;
                translateAll({ comments, datastore, promptKey: "comment_english" })
                break;
            case "french":
                bulkTranslationCanceled = false;
                translateAll({ comments, datastore, promptKey: "comment_french" });
                break;
            case "german":
                bulkTranslationCanceled = false;
                translateAll({ comments, datastore, promptKey: "comment_german" });
                break;
        }
    }

    function selectInterpretation(key) {
        switch (key) {
            case "original":
                // Hide translation and cancel bulk process
                bulkTranslationCanceled = true;
                window.stop(); // This doesn't stop pending ChatGPT calls, but it prevents the result from being displayed
                comments.forEach(comment => {
                    datastore.modifyObject('comment', comment.key, comment => ({ ...comment, translation: undefined, annotatedText: undefined, translationPending: false }));
                });
                break;
            case "simplify":
                bulkTranslationCanceled = false;
                translateAll({ comments, datastore, promptKey: "comment_simplify" });
                break;
            case "eli5":
                bulkTranslationCanceled = false;
                translateAll({ comments, datastore, promptKey: "comment_eli5" });
                break;
            case "explainWords":
                bulkTranslationCanceled = false;
                explainWordsAll({ comments, datastore, promptKey: "comment_explain_words" });
                break;
            case "poem":
                bulkTranslationCanceled = false;
                translateAll({ comments, datastore, promptKey: "comment_poem" });
                break;
            case "emojify":
                bulkTranslationCanceled = false;
                translateAll({ comments, datastore, promptKey: "comment_emojify" });
                break;
            case "cool":
                bulkTranslationCanceled = false;
                translateAll({ comments, datastore, promptKey: "comment_cool" });
                break;
            case "sophisticated":
                bulkTranslationCanceled = false;
                translateAll({ comments, datastore, promptKey: "comment_sophisticated" });
                break;
            case "runes":
                bulkTranslationCanceled = false;
                translateAll({ comments, datastore, promptKey: "comment_runes" });
                break;
        }
    }

    return <ScrollableScreen maxWidth={800}>

        <View style={s.dropdownTop} >
            <DropDownSelector label='Language' value={datastore} onChange={selectLanguage} options={[
                { key: 'original', label: 'Original' },
                { key: 'english', label: '🇺🇸 English' },
                { key: 'french', label: '🇫🇷 French' },
                { key: 'german', label: '🇩🇪 German' }
            ]} />
        </View>

        <Pad size={24}/>

        <MediaLibraryPost
            primaryVideoTitle={mediaInfo.primaryVideoTitle}
            videoSummary={mediaInfo.videoSummary}
            videoLength={mediaInfo.videoLength}
            videoDate={mediaInfo.videoDate}
            videoKey={mediaInfo.videoKey}
        />
        
        <View style={s.commentsMenu} >
            <SmallTitleLabel label="Comments"/>
            <DropDownSelector label='Interpret All' value={datastore} onChange={selectInterpretation} options={[
                { key: 'original', label: 'Original' },
                { key: 'simplify', label: '🤔 Simplify' },
                { key: 'eli5', label: '👶 ELI5' },
                { key: 'explainWords', label: '🔍 Explain Words' },
                { key: 'poem', label: '📜 Poem' },
                { key: 'emojify', label: '🦄 Emojify' },
                { key: 'cool', label: '😎 Cool' },
                { key: 'sophisticated', label: '🧐 Sophisticated' },
                { key: 'runes', label: '🧱 Runes' }
            ]} />
        </View>
        
        <CommentContext.Provider value={commentConfig}>
            <TranslatedComments/>
        </CommentContext.Provider>
        
        <Pad size={24} />
    </ScrollableScreen>
}

const WorldInterpreterStyle = StyleSheet.create({
    dropdownTop: {
        alignSelf: "flex-end"
    },
    commentsMenu: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    }
});

// Translating multiple comments
async function translateAll({ comments, datastore, promptKey }) {
    comments.forEach((comment) => {
        datastore.modifyObject('comment', comment.key, comment => ({ ...comment, translationPending: true }));
    });
    
    let commentCounter = 0;
    for (const comment of comments) {
        if (bulkTranslationCanceled) {
            console.log("Bulk translation canceled");
            return;
        }

        const response = await gptProcessAsync({ promptKey, params: { text: comment.text } });
        datastore.modifyObject('comment', comment.key, comment => ({ ...comment, translation: response.translation, translationPending: false }));

        // Generous timeout because we have a rate limit of 3 requests per minute
        if (commentCounter < comments.length - 1) {
            console.log("Waiting to process next comment");
            await sleep(20000);
        }

        commentCounter++;
    }
}

// Translating a single comment
async function translate({ comment, commentKey, datastore, promptKey }) {
    datastore.modifyObject('comment', commentKey, comment => ({...comment, translationPending: true}));
    const response = await gptProcessAsync({ promptKey, params: { text: comment.text } });
    datastore.modifyObject('comment', commentKey, comment => ({ ...comment, translation: response.translation, translationPending: false }));
}

// Explaining unknown words in multiple comments
async function explainWordsAll({ comments, datastore, promptKey }) {
    // Mark all comment translations as pending so the user sees there's something in progress even if it takes a while
    comments.forEach((comment) => {
        datastore.modifyObject('comment', comment.key, comment => ({ ...comment, translationPending: true }));
    });
    
    let commentCounter = 0;
    for (const comment of comments) {
        if (bulkTranslationCanceled) {
            console.log("Bulk translation canceled");
            return;
        }

        await explainWords({ comment, commentKey: comment.key, datastore, promptKey: "comment_explain_words" });

        // Generous timeout because we have a rate limit of 3 requests per minute
        if (commentCounter < comments.length - 1) {
            console.log("Waiting to process next comment");
            await sleep(20000);
        }

        commentCounter++;
    }
}

// Explaining unknown words in a single comment
async function explainWords({ comment, commentKey, datastore, promptKey }) {
    datastore.modifyObject('comment', commentKey, comment => ({ ...comment, translationPending: true }));

    const response = await gptProcessAsync({ promptKey: promptKey, params: { text: comment.text } });

    let remainingText = comment.text;
    let annotatedText = [];
    let result = -1;

    // Check where the phrases that need to be explained are. Split the comment into an array with explanations as needed. Currently, this only marks the first occurrence
    response.forEach(explainedPhrase => {
        result = remainingText.indexOf(explainedPhrase.phrase);

        if (result === -1) {
            return;
        }

        annotatedText.push(
            { text: remainingText.substr(0, result), needsExplanation: false },
            { text: remainingText.substr(result, explainedPhrase.phrase.length), needsExplanation: true, explanation: explainedPhrase.explanation }
        );

        remainingText = remainingText.slice(result + explainedPhrase.phrase.length);
    });

    // Catch the last part of the comment
    if (remainingText !== "") {
        annotatedText.push({ text: remainingText, needsExplanation: false });
    }

    console.log("annotatedText: ", annotatedText);

    datastore.modifyObject('comment', commentKey, comment => ({ ...comment, annotatedText: annotatedText, translationPending: false }));
}

function ActionTranslate({ comment, commentKey }) {
    const datastore = useDatastore();

    function selectLanguage(key) {
        switch (key) {
            case "original":
                // Hide translation
                window.stop(); // This doesn't stop pending ChatGPT calls, but it prevents the result from being displayed
                datastore.modifyObject('comment', commentKey, comment => ({ ...comment, translation: undefined, annotatedText: undefined, translationPending: false }));
                break;
            case "english":
                // Translate this comment into English
                translate({ comment, commentKey, datastore, promptKey: "comment_english" });
                break;
            case "french":
                // Translate this comment into French
                translate({ comment, commentKey, datastore, promptKey: "comment_french" });
                break;
            case "german":
                // Translate this comment into German
                bulkTranslationCanceled = false;
                translate({ comment, commentKey, datastore, promptKey: "comment_german" });
                break;
        }
    }

    return <View style={{ paddingRight: 20, paddingTop: 3.5 }}>
        <DropDownSelector label='Translate' value={datastore} onChange={selectLanguage} options={[
            { key: 'original', label: 'Original' },
            { key: 'english', label: '🇺🇸 English' },
            { key: 'french', label: '🇫🇷 French' },
            { key: 'german', label: '🇩🇪 German' }
        ]} />
    </View>
}

function ActionInterpret({ comment, commentKey }) {
    const datastore = useDatastore();

    function selectInterpretation(key) {
        switch (key) {
            case "original":
                // Hide translation
                window.stop(); // This doesn't stop pending ChatGPT calls, but it prevents the result from being displayed
                datastore.modifyObject('comment', commentKey, comment => ({ ...comment, translation: undefined, annotatedText: undefined, translationPending: false }));
                break;
            case "simplify":
                translate({ comment, commentKey, datastore, promptKey: "comment_simplify" });
                break;
            case "eli5":
                translate({ comment, commentKey, datastore, promptKey: "comment_eli5" });
                break;
            case "explainWords":
                explainWords({ comment, commentKey, datastore, promptKey: "comment_explain_words" });
                break;
            case "poem":
                translate({ comment, commentKey, datastore, promptKey: "comment_poem" });
                break;
            case "emojify":
                translate({ comment, commentKey, datastore, promptKey: "comment_emojify" });
                break;
            case "cool":
                translate({ comment, commentKey, datastore, promptKey: "comment_cool" });
                break;
            case "sophisticated":
                translate({ comment, commentKey, datastore, promptKey: "comment_sophisticated" });
                break;
            case "runes":
                translate({ comment, commentKey, datastore, promptKey: "comment_runes" });
                break;
        }
    }
    
    return <View style={{ paddingRight: 20, paddingTop: 3.5 }}>
        <DropDownSelector label='Interpret' value={datastore} onChange={selectInterpretation} options={[
            { key: 'original', label: 'Original' },
            { key: 'simplify', label: '🤔 Simplify' },
            { key: 'eli5', label: '👶 ELI5' },
            { key: 'explainWords', label: '🔍 Explain Words' }, // TODO: Working title
            { key: 'poem', label: '📜 Poem' },
            { key: 'emojify', label: '🦄 Emojify' },
            { key: 'cool', label: '😎 Cool' },
            { key: 'sophisticated', label: '🧐 Sophisticated' },
            { key: 'runes', label: '🧱 Runes' }
        ]} />
    </View>
}