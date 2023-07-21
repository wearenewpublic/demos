import { ChatPrototype } from "./Chat";
import { RoboMediatorChatPrototype } from "./RoboMediatorChat";
import { RuleEnforcerChatPrototype } from "./RuleEnforcer";
import { ExamplePrototype } from "./Example";
import { ThreadedCommentsPrototype } from "./ThreadedComments";
import { VideoResponse } from "./VideoResponse";
import { SimulatedChat } from "./SimulatedChat";
import { OpenHousePrototype } from "./OpenHouse";
import { ParentApproves } from "./ParentApproves";
import { ArticleCommentsPrototype } from "./ArticleComments";
import { PrivateRuleEnforcerPrototype } from "./PrivateRuleEnforcer";
import { AudioResponsePrototype } from "./AudioResponse";
import { ArticleQuestionsPrototype } from "./ArticleQuestions";
import { concept_comments_slider } from "./concepts";
import { OptionallyAnonymous } from "./OptionallyAnonymous";
import { SemiAnonymous } from "./SemiAnonymous";
import { InnerOuter } from "./InnerOuter";
import { PostFeedPrototype } from "./PostFeed";

export const prototypes = [
    ExamplePrototype, ChatPrototype, ThreadedCommentsPrototype, RoboMediatorChatPrototype, RuleEnforcerChatPrototype, VideoResponse,
    SimulatedChat, OpenHousePrototype, ParentApproves, ArticleCommentsPrototype, PrivateRuleEnforcerPrototype,
    AudioResponsePrototype, ArticleQuestionsPrototype, OptionallyAnonymous, SemiAnonymous,
    InnerOuter, PostFeedPrototype,

    concept_comments_slider
]

