import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { MaybeClickable } from "../../component/basics";
import { useTranslation } from "../../component/translation";
import { useDatastore } from "../../util/datastore";

export function LiveChatInput({onSend, disabled=false}) {
    const [text, setText] = useState('');
    const placeholder = useTranslation('Type a message');
    const s = ChatInputStyle;
    const [hover, setHover] = useState(false);
    
    const datastore = useDatastore();
    const selfKey = datastore.getPersonaKey();
    const self = datastore.getObject("persona", selfKey);
    const lastMessageFromSelf = datastore.getObject("message", self.lastMessageKey)?.text;

    if (self.isEditing) {
        disabled = true;
    }

    function onFocus() {
        if (self.isEditing) {
            setText(lastMessageFromSelf);
            datastore.modifyObject("persona", selfKey, persona => ({ ...persona, isEditing: false }));
            disabled = false;
        }
    }

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
            value={self.isEditing ? lastMessageFromSelf : text}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor='#999'
            onKeyPress={onKeyPress}
            editable={!disabled}
            onFocus={onFocus}
            multiline={true}
        />
        <MaybeClickable isClickable={!disabled} onPress={onPressSend}>
            <Ionicons name='md-send' size={24} color={disabled ? '#999' : '#0084ff'} />
        </MaybeClickable>
    </View>
}

const ChatInputStyle = StyleSheet.create({
    textInput: {
        backgroundColor: '#f4f4f4',
        borderRadius: 8, 
        borderWidth: StyleSheet.hairlineWidth, 
        borderColor: '#ddd',
        padding: 8,
        marginVertical: 8,
        marginHorizontal: 8,
        flexShrink: 0,
        fontSize: 16,
        lineHeight: 20,
        flexGrow: 1
    },
    hover: {
        borderColor: '#999'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})