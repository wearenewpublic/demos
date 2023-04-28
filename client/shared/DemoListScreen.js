import { Text } from "react-native"
import { Card, Clickable, ScrollableScreen } from "../component/basics"

export function DemoListScreen({onSelectDemo}) {
    return (
        <ScrollableScreen>
            <Clickable onPress={() => onSelectDemo('stub')}>
                <Card>
                    <Text>Demo List</Text>
                </Card>
            </Clickable>
            <Card>
                <Text>Much Longer Demo Name</Text>
            </Card>
        </ScrollableScreen>
    )
}


