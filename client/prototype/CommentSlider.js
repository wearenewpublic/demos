import { BigTitle, ScrollableScreen } from "../component/basics";
import { QuietSystemMessage } from "../component/message";
import { Post, PostActionEdit, PostActionLike } from "../component/post";
import { RatingWithLabel, SpectrumRating } from "../component/rating";
import { PostInput } from "../component/replyinput";
import { TranslatableText } from "../component/translation";
import { authorRobEnnals } from "../data/authors";
import { post_starwars } from "../data/posts";
import { statusTentative } from "../data/tags";
import { useCollection, useGlobalProperty, usePersonaKey } from "../util/datastore";
import { expandDataList } from "../util/util";

export const CommentSliderPrototype = {
    key: 'commentsliderqa',
    date: 'Mon Jul 24 2023 20:50:03 GMT-0700 (Pacific Daylight Time)',
    name: 'CommentSlider Q&A',
    author: authorRobEnnals,
    description: 'When writing an opinion about a disputed topic, say where you stand on the spectrum of opinion',
    tags: [],
    status: statusTentative,
    screen: CommentSliderScreen,
    instance: [
        {
            key: 'wars', name: 'Star Wars',
            question: 'Which is better. Star Wars or Star Trek?',
            sideOne: 'Pro Star Wars',
            sideTwo: 'Pro Star Trek',
            post: expandDataList(post_starwars)
        }
    ]
}

function CommentSliderScreen() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});
    const question = useGlobalProperty('question');
    const sideOne = useGlobalProperty('sideOne');
    const sideTwo = useGlobalProperty('sideTwo');
    const personaKey = usePersonaKey();
    const hasAnswered = posts.some(post => post.from == personaKey);
    const ratingLabels = getRatingLabels({sideOne, sideTwo});

    return <ScrollableScreen grey>
        <BigTitle>{question}</BigTitle>
        {hasAnswered ? 
            <QuietSystemMessage text='You have already written an opinion' />
        :
            <PostInput placeholder="What's your opinion?" editExtras={[EditRating]} />
        }

        {posts.map(post => 
            <Post key={post.key} post={post} actions={[PostActionLike, PostActionEdit]}
                editWidgets={[EditRating]}
                topBling={<RatingWithLabel value={post.slide} labelSet={ratingLabels} />}
            />
        )}
    </ScrollableScreen>
}

function getRatingLabels({sideOne, sideTwo}) {
    const ratingLabels = [
        'Strongly ' + sideOne,
        sideOne + ' with reservations',
        "It's complicated",
        sideTwo + " with reservations",
        "Strongly " + sideTwo
    ]
    return ratingLabels;
}

function EditRating({value, onChange}) {
    const sideOne = useGlobalProperty('sideOne');
    const sideTwo = useGlobalProperty('sideTwo');
    const ratingLabels = getRatingLabels({sideOne, sideTwo});

    return <RatingWithLabel value={value.slide} editable labelSet={ratingLabels} 
        onChangeValue={slide => onChange({...value, slide})} />
}

