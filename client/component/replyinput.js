import { StyleSheet, Text, TextInput, View } from "react-native";
import { UserFace } from "./userface";
import { addObject, setSessionData, useGlobalProperty } from "../util/localdata";
import { useContext, useState } from "react";
import { PrimaryButton, SecondaryButton } from "./basics";
import { CommentContext } from "./comment";

export function ReplyInput({commentKey}) {
    const personaKey = useGlobalProperty('$personaKey');
    const [text, setText] = useState('');
    const {postHandler} = useContext(CommentContext);
    const s = ReplyInputStyle;

    function onPost() {
        if (postHandler) {
            postHandler({text, replyTo: commentKey});
        } else {
            addObject('comment', {
                from: personaKey, text, replyTo: commentKey
            })
        }
        hideReplyInput();
    }

    function hideReplyInput() {
        setSessionData('replyToComment', null);
    }

    return <View style={s.row}>
        <UserFace userId={personaKey} size={32} />
        <View style={s.right}>
            <TextInput style={s.textInput}
                placeholder='Write a comment...' 
                placeholderTextColor='#999'
                value={text}
                onChangeText={setText}
                multiline={true}
            />
            <View style={s.actions}>
                <PrimaryButton onPress={onPost}>Post</PrimaryButton>
                <SecondaryButton onPress={hideReplyInput}>Cancel</SecondaryButton>
            </View>
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

export function TopCommentInput({about=null}) {
    const personaKey = useGlobalProperty('$personaKey');
    const {postHandler} = useContext(CommentContext);

    const [text, setText] = useState('');
    const s = ReplyInputStyle;

    function onPost() {
        if (postHandler) {
            postHandler({text});
        } else {
            addObject('comment', {
                text,
                replyTo: about
            })
        }
        setText('');
    }

    return <View style={s.row}>
        <UserFace userId={personaKey} size={32} />
        <View style={[s.right, !text ? {height: 40} : null]}>
            <TextInput style={s.textInput}
                placeholder='Write a comment...' 
                placeholderTextColor='#999'
                value={text}
                onChangeText={setText}
                multiline={true}
            />
            {text ? 
                <View style={s.actions}>
                    <PrimaryButton onPress={onPost}>Post</PrimaryButton>
                    <SecondaryButton onPress={() => setText('')}>Cancel</SecondaryButton>
                </View>
            : null}
        </View>
    </View>
}
