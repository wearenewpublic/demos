import { StyleSheet, View } from "react-native";
import { TranslatableLabel } from "./translation";
import { Clickable } from "./basics";

export function TabBar({tabs, selectedTab, onSelectTab}) {
    const s = TabBarStyle;
    return <View style={s.bar}>
        {tabs.map(tab => 
            <Tab key={tab.key} label={tab.label} selected={tab.key == selectedTab} onSelect={() => onSelectTab(tab.key)} />
        )}
    </View>
}
const TabBarStyle = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    }
})

const highlightBlue = '#1876F1';

function Tab({label, selected, onSelect}) {
    const s = TabStyle;
    return <Clickable onPress={onSelect} style={selected ? s.selectedTab : s.tab}>
        <TranslatableLabel label={label} style={selected ? s.selectedText : s.text} />
    </Clickable>
}
const TabStyle = StyleSheet.create({
    selectedTab: {
        borderBottomColor: highlightBlue,
        borderBottomWidth: 3,
        paddingBottom: 9,
        paddingHorizontal: 24
    },
    tab: {
        paddingBottom: 12,
        paddingHorizontal: 24,
    },
    selectedText: {
        fontWeight: 'bold',
        color: highlightBlue,
        fontSize: 15
    },
    text: {
        color: '#999',
        fontWeight: 'bold',
        fontSize: 15 
    }
})




