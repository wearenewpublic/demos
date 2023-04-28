import { ScrollView, TouchableOpacity, View } from "react-native";

export function ScrollableScreen({children}) {
    return <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around'}}>
        <View style={{maxWidth: 500}}>
            <ScrollView style={{maxWidth: 500}}>
                {children}
            </ScrollView>
        </View>
    </View>
}

export function Card({children}) {
    return <View style={{borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, margin: 10}}>
        {children}
    </View>
}

export function Clickable({onPress, children}) {
    return <TouchableOpacity onPress={onPress}>
        {children}
    </TouchableOpacity>
}