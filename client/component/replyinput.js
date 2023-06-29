import { StyleSheet, Text, TextInput, View } from "react-native";
import { UserFace } from "./userface";
// import { addObject, setSessionData, useGlobalProperty, usePersonaKey } from "../util/localdata";
import React, { useContext, useState } from "react";
import { PrimaryButton, SecondaryButton } from "./basics";
import { CommentContext } from "./comment";
import { gotoLogin } from "../util/navigate";
import { useDatastore, usePersonaKey } from "../util/datastore";

export function ReplyInput({commentKey, topLevel = false}) {
    const personaKey = usePersonaKey();
    const datastore = useDatastore();
    const [text, setText] = useState('');
    const {postHandler, getAuthorFace, commentPlaceholder, replyWidgets} = useContext(CommentContext);
    const s = ReplyInputStyle;

    function onPost() {
        if (postHandler) {
            postHandler({datastore, text, replyTo: commentKey});
        } else {
            datastore.addObject('comment', {
                from: personaKey, text, replyTo: commentKey
            })
        }
        if (topLevel) {
            setText('');
        } else {
            hideReplyInput();
        }
    }

    function hideReplyInput() {
        datastore.setSessionData('replyToComment', null);
    }

    if (!personaKey) {
        return <LoginToComment />
    }

    return <View style={s.row}>
        {getAuthorFace({comment: {from: personaKey}})}
        <View style={s.right}>
            <View style={[s.textInputWrapper, (topLevel && !text) ? {height: 40} : null]}>
                <TextInput style={s.textInput}
                    placeholder={commentPlaceholder}
                    placeholderTextColor='#999'
                    value={text}
                    onChangeText={setText}
                    multiline={true}
                />
            </View>
            {(!topLevel || text) ?
                <View>
                    {replyWidgets.map((widget, idx) => 
                        React.createElement(widget, {key: idx, replyTo: commentKey})
                    )}
                </View>
            : null}
            {(!topLevel || text) ? 
                <View style={s.actions}>
                    <PrimaryButton onPress={onPost}>Post</PrimaryButton>
                    <SecondaryButton onPress={hideReplyInput}>Cancel</SecondaryButton>
                </View>
            : null}
        </View>
    </View>
}

const ReplyInputStyle = StyleSheet.create({
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
        // height: 150,
        maxWidth: 500
    },
    row: {
        marginTop: 16,
        flexDirection: 'row',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 8,
    }
})

export function TopCommentInput({about = null}) {
    return ReplyInput({commentKey: about, topLevel: true});
}

function LoginToComment() {
    return <PrimaryButton onPress={gotoLogin}>Login to comment</PrimaryButton>
}