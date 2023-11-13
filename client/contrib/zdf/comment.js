import { StyleSheet, Text, View } from "react-native";
import { UserFace } from "../../component/userface";
import React, { useContext } from "react";
import { BlingLabel, CommentContext } from "../../component/comment";
import { useDatastore, useCollection, useObject, useSessionData } from "../../util/datastore";
import { removeNullProperties } from "../../util/util";
import { TopCommentInput } from "../../component/replyinput";
import { Tooltip } from "react-tooltip";


export function StickyComment({text}) {
    const s = StickyCommentStyle;

    return <View style={s.commentHolder}>
        <View style={s.commentLeft}>
            <UserFace style="s.roboFace" userId="robo" faint={false} />
            <View style={s.verticalLine} />
        </View>
        <View style={s.commentRight}>
            <View style={s.commentBox}>
                <RoboAuthorInfo/>
                <BlingStickyHelp/>
                <Text style={s.text}>{text}</Text>
            </View>
        </View>
    </View>
}

const StickyCommentStyle = StyleSheet.create({
    commentHolder: {
        flexDirection: 'row',
        marginTop: 16,
        backgroundColor: "#EBF3FB",
        borderColor: "#63A4E5",
        borderWidth: 1,
        maxWidth: 523,
        padding: 16,
        borderRadius: 10,
        boxShadow: "3px 3px 2px rgba(111, 118, 124, 0.5)",
    },
    text: {
        fontSize: 15,
        color: '#333',
        maxWidth: 500
    },
    verticalLine: {
        backgroundColor: '#ccc',
        width: 1,
        flex: 1,
        alignSelf: 'center',
        marginTop: 4
    },
    commentRight: {
        flex: 1,
    },
    commentBox: {
        flex: 1,
        marginLeft: 12,
    }
})

function BlingStickyHelp() {
    return <BlingLabel label='💡 Help' color="#63A4E5" />
}

function RoboAuthorInfo() {
    const s = RoboAuthorInfoStyle;

    return <View style={s.authorInfoBox}> 
        <View style={s.authorNameBox}>
            <Text style={s.authorName}>Robot</Text>
            <Text>📌</Text>
        </View>
    </View>
}

const RoboAuthorInfoStyle = StyleSheet.create({
    authorInfoBox: {
        marginBottom: 2
    },
    roboFace: {
        marginLeft: 16,
    },
    authorNameBox: {
        display: "flex",
        flexDirection: 'row',
        justifyContent: "space-between" 
    },
    authorName: {
        fontWeight: 'bold',
        fontSize: 12
    }
});



export function TranslatedComments({ about = null, config = {} }) {
    const datastore = useDatastore();
    const defaultConfig = useContext(CommentContext);
    const newConfig = {...defaultConfig, ...removeNullProperties(config)};
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => 
        (about ? comment.replyTo == about : !comment.replyTo)
        && newConfig.getIsVisible({datastore, comment}));
 
    const sortedComments = newConfig.sortComments({datastore, comments:topLevelComments})

    return <CommentContext.Provider value={newConfig}>
        <TopCommentInput about={about} />
        {sortedComments.map(comment => 
            <TranslatedComment key={comment.key} commentKey={comment.key} />
            // <ExplainedComment key={comment.key} commentKey={comment.key}/>
        )}
    </CommentContext.Provider>
}

export function TranslatedComment({commentKey}) {
    const s = TranslatedCommentStyle;
    const comment = useObject('comment', commentKey);
    const datastore = useDatastore();
    const {actions, replyComponent, getIsDefaultCollapsed, authorFace} = React.useContext(CommentContext);
    const showReplyComponent = useSessionData('replyToComment') == commentKey;
    const sessionCollapsed = useSessionData(['comment', commentKey, 'collapsed']);
    const collapsed = sessionCollapsed ?? getIsDefaultCollapsed({ datastore, commentKey, comment });
    

    let allAnnotatedText = [];
    let key = 0;

    comment.annotatedText?.forEach(annotatedText => {
        let explanation = "Insert an explanation here.";
        if (annotatedText.explanation) {
            explanation = annotatedText.explanation;
        }

        // TODO: Compare found phrases and comment text
        if (annotatedText.needsExplanation === true) {
            allAnnotatedText.push(
                <Text key={key}>
                    <Tooltip id="explanation" multiline={true} style={s.tooltip}/>
                    <Text style={[s.text, s.explanation]}>
                        <a data-tooltip-id="explanation" data-tooltip-content={explanation}>{annotatedText.text}</a>
                    </Text>
                </Text>
            );
            key++;
        }
        else {
            allAnnotatedText.push(
                <Text key={key} style={s.text}>{annotatedText.text}</Text>
            );
            key++;
        }
    });

    function onExpand() {
        datastore.setSessionData(['comment', commentKey, 'collapsed'], false);
    }

    if (!collapsed) {
        return <View style={s.commentHolder}>
            <View style={s.commentLeft}>
                {React.createElement(authorFace, {comment})}
                <View style={s.verticalLine} />
            </View>
            <View style={s.commentRight}>
                <View style={s.commentBox}>
                    <CommentAuthorInfo commentKey={commentKey} />
                    <TopBlingBar commentKey={commentKey} comment={comment} />
                    <Text style={s.text}>{comment?.text}</Text>
                    {(comment.translationPending) ?
                        <View>
                            <Text style={s.translation}>...</Text>
                            <Text style={s.quotation}>↪ ChatGPT is thinking...</Text>
                        </View>
                        // Check if translation or explanation
                        : (comment.translation) ? 
                            <View>
                                <Text style={s.translation}>{comment.translation ? comment.translation : comment.text}</Text>
                                <Text style={s.quotation}>↪ Generated by ChatGPT</Text>
                            </View>
                        : (comment.annotatedText) ?
                            <View>
                                <Text style={s.translation}>{comment.annotatedText ? allAnnotatedText : comment.text}</Text>
                                <Text style={s.quotation}>↪ Generated by ChatGPT</Text>
                            </View>
                        : null
                    }
                    <ActionBar actions={actions} commentKey={commentKey} comment={comment} />
                </View>
                {showReplyComponent ? React.createElement(replyComponent, {commentKey}) : null}
                <TranslatedReplies commentKey={commentKey} />
            </View>
        </View>
    } else {
        return <CollapsedComment commentKey={commentKey} onPress={onExpand} />
    }
}

const TranslatedCommentStyle = StyleSheet.create({
    commentHolder: {
        flexDirection: 'row',
        marginTop: 16,
    },
    text: {
        fontSize: 15,
        color: '#333',
        maxWidth: 500
    },
    translation: {
        backgroundColor: "#e6e9f0",
        borderColor: "#999",
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        maxWidth: 500,
        color: '#333',
        fontSize: 15,
        fontStyle: "italic"
    },
    explanation: {
        color: "white",
        backgroundColor: '#19160f'
    },
    tooltip: {
        backgroundColor: "black",
        color: "white",
        fontFamily: "sans-serif",
        maxWidth: "500px",
        zIndex: "10",
        fontStyle: "normal"
    },
    quotation: {
        fontSize: 11,
        marginBottom: 4
    },
    verticalLine: {
        backgroundColor: '#ccc',
        width: 1,
        flex: 1,
        alignSelf: 'center',
        marginTop: 4
    },
    commentRight: {
        flex: 1,
    },
    commentBox: {
        flex: 1,
        marginLeft: 12,
    }
});

function TranslatedReplies({ commentKey }) {
    const datastore = useDatastore();
    const {getIsVisible, sortComments} = React.useContext(CommentContext);
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const replies = comments.filter(c => c.replyTo == commentKey && getIsVisible({datastore, comment: c}));
    const sortedReplies = sortComments({datastore, comments:replies});
    return <View>
        {sortedReplies.map(reply => 
            <TranslatedComment key={reply.key} commentKey={reply.key} />
        )}
    </View>
}

// ---

// Copied from comments.js because they're needed here, but this is redundant

function CommentAuthorInfo({commentKey, collapsed=false}) {
    const s = CommentAuthorInfoStyle;

    const {authorName, authorBling} = React.useContext(CommentContext);
    const comment = useObject('comment', commentKey);

    return <View style={s.authorInfoBox}> 
        <Text style={collapsed ? s.collapsedAuthorName : s.authorName}>
            {React.createElement(authorName, {comment})}
        </Text>
        <View style={{flexDirection: 'row', marginLeft: 4}}>
            {authorBling.map((bling, idx) => 
                React.createElement(bling, {key: idx, comment})
            )}
        </View>
    </View>
}

const CommentAuthorInfoStyle = StyleSheet.create({
    authorInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2
    },
    authorName: {
        fontWeight: 'bold',
        fontSize: 12
    }, 
    collapsedAuthorName: {
        // fontWeight: 'bold',
        fontSize: 12
    }
});

function TopBlingBar({commentKey, comment}) {
    const {topBling} = React.useContext(CommentContext);
    return <View style={{flexDirection: 'row'}}>
        {topBling.map((bling, idx) => 
            React.createElement(bling, {key: idx, commentKey, comment})
        )}
    </View>
}

function ActionBar({actions, commentKey, comment}) {
    return <View style={{flexDirection: 'row'}}>
        {actions.map((action, idx) => 
            React.createElement(action, {key: idx, commentKey, comment})
        )}
    </View>
}