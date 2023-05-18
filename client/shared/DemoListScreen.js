import { StyleSheet, Text, View } from "react-native"
import { BigTitle, BodyText, Card, Clickable, ScrollableScreen, SmallTitle, TimeText } from "../component/basics"
import { demos } from "../demo"

export function DemoListScreen({onSelectDemo}) {
    const s = DemoListScreenStyle;
    const sortedDemos = demos.sort((a, b) => b.date.localeCompare(a.date));
    return (
        <ScrollableScreen>
            <BigTitle>New Public Demo Garden</BigTitle>
            {sortedDemos.map(demo => 
                <Clickable key={demo.name} onPress={() => onSelectDemo(demo)}>
                    <Card>
                        <View style={s.authorLine}>
                            <SmallTitle>{demo.name}</SmallTitle>
                            <TimeText time={demo.date} />
                        </View>
                        {/* <AuthorLine author={demo.author} date={demo.date} /> */}
                        <BodyText>{demo.description}</BodyText>
                    </Card>
                </Clickable>        
            )}
        </ScrollableScreen>
    )
}

const DemoListScreenStyle = StyleSheet.create({
    authorLine: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4
    }
});
