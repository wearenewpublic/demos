import { StyleSheet, Text, TextInput, View } from "react-native";
import { UserFace } from "./userface";
import { addObject, setSessionData, useGlobalProperty } from "../util/localdata";
import { useContext, useState } from "react";
import { PrimaryButton, SecondaryButton } from "./basics";
import { CommentContext } from "./comment";

export function ReplyInput({commentKey, topLevel = false}) {
    const personaKey = useGlobalProperty('$personaKey');
    const [text, setText] = useState('');
    const {postHandler, getAuthorFace, commentPlaceholder} = useContext(CommentContext);
    const s = ReplyInputStyle;

    function onPost() {
        if (postHandler) {
            postHandler({text, replyTo: commentKey});
        } else {
            addObject('comment', {
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
        setSessionData('replyToComment', null);
    }

    return <View style={s.row}>
        {getAuthorFace({comment: {from: personaKey}})}
        {/* <UserFace userId={personaKey} size={32} /> */}
        <View style={[s.right, (topLevel && !text) ? {height: 40} : null]}>
            <TextInput style={s.textInput}
                placeholder={commentPlaceholder}
                placeholderTextColor='#999'
                value={text}
                onChangeText={setText}
                multiline={true}
            />
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
    right: {
        flex: 1,
        height: 150,
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

