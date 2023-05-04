import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { Clickable } from "./basics";

export function ChatInput({onSend}) {
    const [inProgress, setInProgress] = useState(false)
    const [text, setText] = useState('');
    const s = ChatInputStyle;

    async function onPressSend() {
        setInProgress(true)
        await onSend(text);
        setText('');
        setInProgress(false);
    }

    function onKeyPress(e) {
        if (Platform.OS == 'web' && e.nativeEvent.key == 'Enter') {
            if (!e.nativeEvent.shiftKey && !e.nativeEvent.ctrlKey && !e.nativeEvent.metaKey){
                onPressSend();    
                e.preventDefault();
                return false;
            }
        }
        return true;
    }

    return <View style={s.row}>
        <TextInput style={s.textInput} 
            value={text}
            onChangeText={setText}
            placeholder='Type a message'
            placeholderTextColor='#999'
            onKeyPress={onKeyPress}
        />
        <Clickable onPress={onPressSend}>
            <Ionicons name='md-send' size={24} color={inProgress ? '#999' : '#0084ff'} />
        </Clickable>
    </View>
}

const ChatInputStyle = StyleSheet.create({
    textInput: {
        backgroundColor: '#f4f4f4', borderRadius: 8, 
        borderWidth: StyleSheet.hairlineWidth, 
        borderColor: '#ddd', padding: 8,
        marginVertical: 8,
        marginHorizontal: 8,
        flexShrink: 0,
        fontSize: 16, lineHeight: 20, flexGrow: 1
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})