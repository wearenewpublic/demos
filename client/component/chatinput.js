import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { Clickable } from "./basics";
import { useTranslation } from "./translation";

export function ChatInput({onSend}) {
    const [text, setText] = useState('');
    const placeholder = useTranslation('Type a message');
    const s = ChatInputStyle;
    const [hover, setHover] = useState(false);

    async function onPressSend() {
        setText('');
        await onSend(text);
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
        <TextInput style={[s.textInput, hover ? s.hover : null]} 
            value={text}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor='#999'
            onKeyPress={onKeyPress}
        />
        <Clickable onPress={onPressSend}>
            <Ionicons name='md-send' size={24} color='#0084ff' />
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
    hover: {
        borderColor: '#999'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})