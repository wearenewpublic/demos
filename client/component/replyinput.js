import { StyleSheet, View } from "react-native";
import React, { useContext, useState } from "react";
import { AutoSizeTextInput, Card, PrimaryButton, SecondaryButton } from "./basics";
import { CommentContext } from "./comment";
import { gotoLogin } from "../util/navigate";
import { useDatastore, usePersonaKey } from "../util/datastore";
import { useTranslation } from "./translation";


export function ReplyInput({commentKey=null, topLevel = false, topPad=true}) {
    const personaKey = usePersonaKey();
    const datastore = useDatastore();
    const [post, setPost] = useState({text: '', replyTo: commentKey});
    const {postHandler, cancelHandler, authorFace, getCanPost, getPrimaryButtonLabel, commentPlaceholder, replyWidgets, replyTopWidgets, inputLock, hideInputOnClick, customTextInputWidget} = useContext(CommentContext);
    const s = ReplyInputStyle;

    const placeholderText = useTranslation(commentPlaceholder);

    function onPost() {
        if (postHandler) {
            postHandler({datastore, post});
        } else {
            datastore.addObject('comment', post);
        }

        if (hideInputOnClick) {
            if (topLevel) {
                setPost({text: '', replyTo: commentKey});
            } else {
                hideReplyInput();
            }
        }
    }

    function hideReplyInput() {
        setPost({text: '', replyTo: commentKey})
        datastore.setSessionData('replyToComment', null);

        // Let the respective prototype do whatever it needs to do when the user discards an unposted comment
        if (cancelHandler) {
            cancelHandler();
        }
    }

    if (!personaKey) {
        return <View style={{marginTop: topPad ? 16 : 0}}><LoginToComment /></View>
    }

    return <View style={[s.row, topPad ? {marginTop: 16} : null]}>
        {React.createElement(authorFace, {comment: {from: personaKey}})}
        <View style={s.right}>
            {replyTopWidgets.map((widget, idx) => 
                <View key={idx} style={s.widgetBarTop}>
                    {React.createElement(widget, {key: idx, replyTo: commentKey, post, onPostChanged:setPost})}
                </View>
            )}

            {(post.text && customTextInputWidget !== undefined) ?
                React.createElement(customTextInputWidget)
            :   
                <AutoSizeTextInput style={s.textInput}
                    hoverStyle={{borderColor: '#999'}}
                    placeholder={placeholderText}
                    placeholderTextColor='#999'
                    value={post.text}
                    onChangeText={text => setPost({...post, text})}
                    multiline={true}
                    disabled={inputLock}
                />
            }
            {(!topLevel || post.text) ?
                (replyWidgets.map((widget, idx) => 
                    <View key={idx} style={s.widgetBottom}>
                        {React.createElement(widget, {key: idx, replyTo: commentKey, post, onPostChanged:setPost})}
                    </View>
                ))
            : null}
            {topLevel ?
                <View>
                    {getCanPost({datastore,post}) ?
                        <View style={s.actions}>          
                            <PrimaryButton onPress={onPost} label={getPrimaryButtonLabel()}/>
                            <SecondaryButton onPress={hideReplyInput} label='Cancel' />             
                        </View>
                    : null}
                </View>
            : 
                <View style={s.actions}>
                    {(getCanPost({datastore,post})) ?
                        <PrimaryButton onPress={onPost} label={getPrimaryButtonLabel()}/>
                    : 
                        // TODO: It would be nice to have a style for disabled buttons so they look different
                        <PrimaryButton disabled={true} label={getPrimaryButtonLabel()}/>
                    }
                    <SecondaryButton onPress={hideReplyInput} label='Cancel' />
                </View>
            }
        </View>
    </View>
}

export const ReplyInputStyle = StyleSheet.create({
    textInput: {
        flex: 1,
        borderRadius: 8, 
        borderWidth: StyleSheet.hairlineWidth, 
        borderColor: '#ddd', padding: 8,
        marginHorizontal: 8,
        fontSize: 15, lineHeight: 20,
        height: 150,
    },
    textInputWrapper: {
        height: 150,
    },
    right: {
        flex: 1,
        maxWidth: 500
    },
    row: {
        flexDirection: 'row',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 8,
    },
    widgetBarTop: {
        marginLeft: 8,
        // marginBottom: 8,
    },
    widgetBottom: {
        marginLeft: 8,
        marginTop: 8,
    }
});

export function TopCommentInput({about = null}) {
    return ReplyInput({commentKey: about, topLevel: true});
}

export function PostInput({placeholder = "What\'s on your mind?", postHandler=null, topWidgets=[], bottomWidgets=[], getCanPost=null}) {
    const commentContext = useContext(CommentContext);
    function defaultPostHandler({datastore, post}) {
        datastore.addObject('post', post)
    }
    return <CommentContext.Provider value={{...commentContext, postHandler: postHandler ?? defaultPostHandler, 
                commentPlaceholder:placeholder, replyTopWidgets: topWidgets, replyWidgets: bottomWidgets,
                getCanPost: getCanPost ?? commentContext.getCanPost}}>
        <Card>
            <ReplyInput topLevel topPad={false} />
        </Card>
    </CommentContext.Provider>
}


function LoginToComment() {
    return <PrimaryButton onPress={gotoLogin} label='Log in to comment' />
}
