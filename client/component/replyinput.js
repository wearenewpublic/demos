import { StyleSheet, Text, TextInput, View } from "react-native";
import { UserFace } from "./userface";
import { addObject, setSessionData, useGlobalProperty } from "../util/localdata";
import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "./basics";

export function ReplyInput({commentKey}) {
    const personaKey = useGlobalProperty('$personaKey');
    const [text, setText] = useState('');
    const s = ReplyInputStyle;

    function onPost() {
        addObject('comment', {
            from: personaKey, text, replyTo: commentKey
        })
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
                placeHolderTextColor='#999'
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
        marginVertical: 16,
        flexDirection: 'row',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 8,
    }
})