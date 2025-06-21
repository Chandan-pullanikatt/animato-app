import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { useTheme } from '../contexts/ThemeContext';
import { generateEnhancedScript } from '../utils/api';

type ScriptSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ScriptSelection'>;

interface ScriptSelectionScreenProps {
  navigation: ScriptSelectionScreenNavigationProp;
  route?: {
    params?: {
      contentTheme?: string;
    }
  }
}

type ScriptTemplate = {
  id: string;
  title: string;
  description: string;
  content: string;
};

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Theme-specific templates - 3 unique templates for each of the 8 content themes (24 total)
const getTemplatesForTheme = (theme: string): ScriptTemplate[] => {
  const templatesByTheme: Record<string, ScriptTemplate[]> = {
    comedy: [
      {
        id: 'comedy_1',
        title: 'The Worst Wedding Planner',
        description: 'Everything that can go wrong at a wedding does',
        content: `SCENE 1: EXTERIOR - WEDDING VENUE - MORNING

JENNY (30s), frazzled wedding planner, arrives to find the venue flooded.

JENNY
(panicking)
This is fine. This is totally fine.

Her phone rings. She answers while standing in ankle-deep water.

JENNY (CONT'D)
Hello, Bride? Small problem... the venue is underwater.

BRIDE (V.O.)
(screaming)
WHAT?!

JENNY
But I have a backup plan! Sort of...

CUT TO:

SCENE 2: EXTERIOR - PARK - LATER

Jenny frantically sets up chairs in a muddy park as dark clouds gather.

JENNY
(to herself)
Outdoor wedding. Very... rustic.

Thunder rumbles. It starts to rain.

JENNY (CONT'D)
(forced smile to arriving guests)
Welcome to our... water-themed celebration!

THE END`
      },
      {
        id: 'comedy_2',
        title: 'The Food Truck Fiasco',
        description: 'A chef\'s grand opening goes hilariously wrong',
        content: `SCENE 1: EXTERIOR - CITY STREET - MORNING

MARCO (35), enthusiastic chef, opens his new food truck "Marco's Magnificent Meals."

MARCO
(to camera)
Today, I become a culinary legend!

He turns on the grill. Smoke billows out everywhere.

MARCO (CONT'D)
(coughing)
That's... that's normal, right?

CUSTOMER #1 approaches the window.

CUSTOMER #1
I'll have a burger, please.

MARCO
Coming right up!

He flips a patty. It flies out of the truck and lands on a passing dog.

MARCO (CONT'D)
(nervous laugh)
Would you like fries with that?

THE END`
      },
      {
        id: 'comedy_3',
        title: 'The Substitute Teacher',
        description: 'A substitute teacher faces chaos in the classroom',
        content: `SCENE 1: INTERIOR - ELEMENTARY SCHOOL HALLWAY - MORNING

DAVE (40s), nervous substitute teacher, walks down the hallway carrying a briefcase.

DAVE
(to himself)
How hard can teaching 8-year-olds be?

He opens the classroom door. Paper airplanes fly past his head.

DAVE (CONT'D)
(ducking)
Good morning, class!

STUDENT #1
(standing on desk)
Are you our new victim... I mean, teacher?

DAVE
(gulp)
Yes, I'm Mr. Dave, and today we're going to learn about—

A rubber ball hits him in the face.

DAVE (CONT'D)
(dazed)
...survival.

THE END`
      }
    ],
    drama: [
      {
        id: 'drama_1',
        title: 'The Last Letter',
        description: 'A touching story about forgiveness and family',
        content: `SCENE 1: INTERIOR - SARAH'S APARTMENT - EVENING

SARAH (35) sits at her kitchen table, holding an unopened letter. Her hands shake.

SARAH
(whispers)
Twenty years... and now this.

She carefully opens the envelope marked "From Dad."

SARAH (CONT'D)
(reading)
"My dearest Sarah, if you're reading this, I'm gone..."

Tears well up in her eyes.

SARAH (CONT'D)
(continuing to read)
"I know I wasn't the father you deserved. I was too proud to say I'm sorry."

She clutches the letter to her chest.

SARAH (CONT'D)
(sobbing)
Dad... I forgive you.

She looks at a framed photo of them when she was young.

SARAH (CONT'D)
I forgive you.

THE END`
      },
      {
        id: 'drama_2',
        title: 'The Choice',
        description: 'A mother faces an impossible decision',
        content: `SCENE 1: INTERIOR - HOSPITAL ROOM - DAY

MARIA (45) sits beside her unconscious son CARLOS (16). Doctor WILLIAMS enters.

DR. WILLIAMS
Maria, we need to discuss Carlos's condition.

MARIA
(not looking away from Carlos)
He's going to wake up. He has to.

DR. WILLIAMS
The experimental treatment could save him, but...

MARIA
(turning)
But what?

DR. WILLIAMS
It's risky. And expensive. Your insurance won't cover it.

Maria takes Carlos's hand.

MARIA
How much?

DR. WILLIAMS
Two hundred thousand dollars.

Maria closes her eyes, tears falling.

MARIA
(determined)
Then we'll find a way.

THE END`
      },
      {
        id: 'drama_3',
        title: 'Coming Home',
        description: 'A soldier returns to a changed world',
        content: `SCENE 1: EXTERIOR - SMALL TOWN TRAIN STATION - DAY

JAKE (28), in military uniform, steps off the train. The town looks smaller than he remembered.

JAKE
(to himself)
Three years... feels like a lifetime.

He walks down Main Street. Some buildings are boarded up.

OLD MAN
(recognizing him)
Jake? Jake Morrison?

JAKE
(smiling)
Hey, Mr. Peterson.

OLD MAN
Welcome home, son. Your mama's been waiting.

Jake's smile fades as he sees his childhood home with a "For Sale" sign.

JAKE
(confused)
Where... where is she?

OLD MAN
(sadly)
The nursing home, son. She's been asking for you.

Jake drops his duffel bag.

THE END`
      }
    ],
    horror: [
      {
        id: 'horror_1',
        title: 'The Night Shift',
        description: 'A security guard encounters something terrifying',
        content: `SCENE 1: INTERIOR - OFFICE BUILDING LOBBY - NIGHT

MIKE (40s), security guard, sits at his desk. The building is eerily quiet.

MIKE
(into radio)
All clear on floor one.

A shadow moves past the window behind him. He doesn't notice.

MIKE (CONT'D)
(checking monitors)
Everything normal on—

One monitor shows a figure standing in the hallway. Mike looks up at the actual hallway. Empty.

MIKE (CONT'D)
(confused)
What the hell?

He looks back at the monitor. The figure is closer.

MIKE (CONT'D)
(standing up)
This isn't possible.

The lights flicker. When they steady, the figure is standing right behind him in the reflection of his computer screen.

MIKE (CONT'D)
(turning around)
Who's there?

Nothing. He's alone.

THE END`
      },
      {
        id: 'horror_2',
        title: 'The Dollhouse',
        description: 'A child\'s toy holds a dark secret',
        content: `SCENE 1: INTERIOR - CHILD'S BEDROOM - NIGHT

EMMA (8) sleeps peacefully. Her antique dollhouse sits in the corner, a gift from her grandmother.

A tiny light flickers inside the dollhouse.

EMMA
(stirring)
Mommy?

She sits up and looks at the dollhouse. The tiny furniture has been rearranged.

EMMA (CONT'D)
(whispering)
I didn't move those...

She approaches the dollhouse. Inside, tiny dolls are seated around a miniature dinner table.

EMMA (CONT'D)
(confused)
But you were in the toy box...

One of the dolls turns its head to look at her.

EMMA (CONT'D)
(screaming)
MOMMY!

The dollhouse goes dark.

THE END`
      },
      {
        id: 'horror_3',
        title: 'The Mirror',
        description: 'A reflection that doesn\'t match reality',
        content: `SCENE 1: INTERIOR - BATHROOM - MORNING

SARAH (25) brushes her teeth. In the mirror, her reflection brushes normally.

SARAH
(humming)

She rinses and spits. Her reflection continues brushing.

SARAH (CONT'D)
(confused)
What the...

She stops moving. Her reflection keeps brushing its teeth.

SARAH (CONT'D)
(panicking)
This isn't real. This isn't real.

She touches the mirror. Her reflection smiles and waves with its free hand.

SARAH (CONT'D)
(screaming)
HELP! SOMEBODY HELP ME!

She runs out. In the mirror, her reflection watches her go, still smiling.

THE END`
      }
    ],
    action: [
      {
        id: 'action_1',
        title: 'The Heist',
        description: 'A high-stakes bank robbery goes wrong',
        content: `SCENE 1: EXTERIOR - CITY BANK - DAY

JACK (35), professional thief, approaches the bank. His team waits in a van.

JACK
(into earpiece)
We go in sixty seconds.

VOICE (V.O.)
Copy that. All exits covered.

Jack checks his watch. 2:47 PM.

JACK
(into earpiece)
Wait... do you hear that?

Police sirens wail in the distance, getting closer.

VOICE (V.O.)
(panicked)
Jack, we've been made! Abort! ABORT!

JACK
(running back to van)
GO! GO! GO!

The van screeches away as police cars surround the bank.

JACK (CONT'D)
(breathing heavily)
How did they know?

VOICE
Someone tipped them off.

Jack's eyes narrow.

JACK
We have a traitor.

THE END`
      },
      {
        id: 'action_2',
        title: 'The Chase',
        description: 'A courier races against time',
        content: `SCENE 1: EXTERIOR - CITY STREET - DAY

MAYA (28), motorcycle courier, speeds through traffic with a mysterious package strapped to her bike.

MAYA
(into phone)
I've got the package. ETA five minutes.

VOICE (V.O.)
Be careful, Maya. People have died for what you're carrying.

Black SUVs appear in her mirrors.

MAYA
(accelerating)
Too late for careful!

She weaves between cars. The SUVs follow, ramming other vehicles aside.

MAYA (CONT'D)
(into phone)
I've got company!

She takes a sharp turn into an alley. The SUVs screech to follow.

MAYA (CONT'D)
(seeing dead end)
Oh, come on!

She guns the engine and launches off a ramp, flying over the SUVs.

MAYA (CONT'D)
(mid-air)
I really need a new job!

THE END`
      },
      {
        id: 'action_3',
        title: 'The Bodyguard',
        description: 'Protecting a witness becomes deadly',
        content: `SCENE 1: INTERIOR - SAFE HOUSE - DAY

ALEX (40s), bodyguard, checks the windows. WITNESS (30s) sits nervously at the table.

ALEX
Stay away from the windows.

WITNESS
How long do we have to stay here?

ALEX
Until the trial. Two more days.

A red laser dot appears on the wall next to the witness.

ALEX (CONT'D)
(diving)
GET DOWN!

The window explodes as a sniper's bullet crashes through.

ALEX (CONT'D)
(into radio)
Safe house is compromised! We need extraction NOW!

WITNESS
(terrified)
They found us!

ALEX
(grabbing weapons)
Stay behind me. We're getting out of here.

More shots ring out.

ALEX (CONT'D)
(determined)
Not on my watch.

THE END`
      }
    ],
    romance: [
      {
        id: 'romance_1',
        title: 'The Coffee Shop Meet-Cute',
        description: 'Two strangers keep meeting by chance',
        content: `SCENE 1: INTERIOR - COFFEE SHOP - MORNING

LILY (26) orders her usual coffee. JAMES (28) accidentally bumps into her, spilling coffee on her laptop.

JAMES
I'm so sorry! Let me buy you another coffee and pay for repairs!

LILY
(laughing)
It's okay, it's waterproof. But this is the third time this week you've bumped into me.

JAMES
(embarrassed)
Third time? I... I'm not usually this clumsy.

LILY
(smiling)
Are you sure you're not doing it on purpose?

JAMES
(blushing)
Would it be terrible if I said maybe?

LILY
(grinning)
Only if you don't ask me out properly this time.

JAMES
(relieved)
Lily... would you like to have dinner with me? Somewhere with no coffee involved?

LILY
I thought you'd never ask.

THE END`
      },
      {
        id: 'romance_2',
        title: 'The Wedding Planner\'s Dilemma',
        description: 'A wedding planner falls for the groom',
        content: `SCENE 1: INTERIOR - WEDDING VENUE - DAY

SOPHIA (30), wedding planner, discusses details with DAVID (32), the groom.

SOPHIA
Everything will be perfect for your big day.

DAVID
You've been amazing, Sophia. I don't know how to thank you.

Their eyes meet. Chemistry is undeniable.

SOPHIA
(stepping back)
It's my job. Your fiancée is lucky.

DAVID
(hesitating)
Sophia... can I tell you something?

SOPHIA
(nervous)
What?

DAVID
I've been having doubts. About everything.

SOPHIA
(conflicted)
David, you're getting married tomorrow.

DAVID
I know. But meeting you has made me realize...

SOPHIA
(interrupting)
Don't. Please don't say it.

DAVID
I think I'm falling for the wrong person.

Sophia's heart breaks and soars at the same time.

THE END`
      },
      {
        id: 'romance_3',
        title: 'The Time Capsule',
        description: 'Childhood sweethearts reunite after years',
        content: `SCENE 1: EXTERIOR - OLD SCHOOL PLAYGROUND - DAY

ANNA (29) digs up a time capsule she buried 15 years ago. MARK (30) appears behind her.

MARK
I wondered if you'd remember.

ANNA
(turning, shocked)
Mark? After all these years?

MARK
I never forgot. I come here every year on this day.

ANNA
(emotional)
I thought you'd moved on. Married. Kids.

MARK
I tried. But no one ever compared to my first love.

Anna opens the time capsule. Inside: childhood photos, a friendship bracelet, and a letter.

ANNA
(reading)
"Dear Future Anna, I hope you marry Mark because he's the best boy ever."

MARK
(smiling)
Smart kid.

ANNA
(tearful)
I wrote the same thing about you.

They look at each other, 15 years melting away.

MARK
So... want to give that eight-year-old what she wanted?

THE END`
      }
    ],
    thriller: [
      {
        id: 'thriller_1',
        title: 'The Phone Call',
        description: 'A wrong number leads to a conspiracy',
        content: `SCENE 1: INTERIOR - APARTMENT - NIGHT

RACHEL (32) answers her phone. Unknown number.

VOICE
The package is ready. Pier 47, midnight.

RACHEL
I think you have the wrong number.

VOICE
(pause)
No... I don't think I do, Rachel.

Rachel's blood runs cold. She never gave her name.

RACHEL
Who is this?

VOICE
Someone who's been watching you. You have something we need.

RACHEL
I don't know what you're talking about.

VOICE
Your father's research. We know you have it.

RACHEL
My father died in a car accident.

VOICE
(laughing)
Is that what they told you? Pier 47. Midnight. Come alone.

The line goes dead. Rachel stares at the phone, terrified.

THE END`
      },
      {
        id: 'thriller_2',
        title: 'The Stalker',
        description: 'Someone is watching from the shadows',
        content: `SCENE 1: EXTERIOR - SUBURBAN STREET - EVENING

KATE (28) walks home from work. Footsteps echo behind her, matching her pace.

She speeds up. The footsteps speed up.

She stops. The footsteps stop.

KATE
(turning)
Hello?

The street is empty. Street lamps flicker.

KATE (CONT'D)
(to herself)
Just paranoid.

She continues walking. A figure ducks behind a car.

KATE (CONT'D)
(phone buzzing)
Hello?

VOICE
You look beautiful in that blue dress.

Kate looks down. She is wearing a blue dress.

KATE
(panicking)
Who is this? Where are you?

VOICE
Closer than you think.

Kate runs. The figure emerges from behind the car, following.

THE END`
      },
      {
        id: 'thriller_3',
        title: 'The Memory Card',
        description: 'A photographer captures something dangerous',
        content: `SCENE 1: INTERIOR - PHOTO STUDIO - NIGHT

TOM (35), photographer, reviews photos from a wedding shoot on his computer. One image makes him freeze.

TOM
(whispers)
That's impossible.

In the background of a wedding photo, two men are exchanging briefcases. One man is a known politician.

TOM (CONT'D)
(zooming in)
What were you doing there, Senator?

His phone rings. Unknown number.

TOM (CONT'D)
Hello?

VOICE
You saw something you shouldn't have.

TOM
(nervous)
I don't know what you mean.

VOICE
Delete the photos, Tom. All of them.

TOM
How do you know my name?

VOICE
We know everything about you. Your studio. Your apartment. Your sister's address.

Tom's hands shake.

THE END`
      }
    ],
    fantasy: [
      {
        id: 'fantasy_1',
        title: 'The Last Dragon Keeper',
        description: 'A young woman discovers she can speak to dragons',
        content: `SCENE 1: EXTERIOR - MOUNTAIN CAVE - DAY

ARIA (22) approaches a massive cave. Ancient symbols glow on the entrance.

A low rumble echoes from within.

DRAGON (V.O.)
(deep, ancient voice)
You have finally come, young keeper.

ARIA
(shocked)
You... you can speak?

A massive dragon emerges from the shadows, scales shimmering like emeralds.

DRAGON
I have been waiting for you, Aria of the Bloodline.

ARIA
How do you know my name?

DRAGON
Your grandmother was my keeper before you. She told me you would come when the darkness returned.

ARIA
What darkness?

The dragon's eyes glow with ancient wisdom.

DRAGON
The Shadow King rises again. Only a true Dragon Keeper can stop him.

ARIA
(overwhelmed)
I'm just a college student. I can't—

DRAGON
You can hear my voice. That makes you more powerful than you know.

THE END`
      },
      {
        id: 'fantasy_2',
        title: 'The Magic Library',
        description: 'Books that write themselves hold ancient secrets',
        content: `SCENE 1: INTERIOR - ANCIENT LIBRARY - NIGHT

ELENA (25), librarian, works late. She notices a book writing itself, words appearing on blank pages.

ELENA
(approaching cautiously)
That's... not possible.

She reads over the book's shoulder.

ELENA (CONT'D)
(reading aloud)
"The one who reads this will unlock the power of the Scribes..."

The book slams shut by itself.

ELENA (CONT'D)
(jumping back)
Okay, that's definitely not normal.

She opens the book again. New words appear:

"Welcome, Elena. We have been waiting."

ELENA (CONT'D)
(to the book)
Who's 'we'?

All around her, books begin opening themselves, pages fluttering.

ELENA (CONT'D)
(amazed)
You're all alive.

The books write in unison: "Help us, Elena. The Dark Scribe comes."

THE END`
      },
      {
        id: 'fantasy_3',
        title: 'The Weather Witch',
        description: 'A woman discovers she can control the weather',
        content: `SCENE 1: EXTERIOR - CITY PARK - DAY

STORM (24) sits on a bench, upset after losing her job. Dark clouds gather overhead.

STORM
(angry)
Why does everything go wrong for me?

Thunder rumbles. Rain begins to fall.

STORM (CONT'D)
(standing up)
Even the weather hates me!

Lightning strikes a nearby tree. Storm looks up, surprised.

STORM (CONT'D)
(confused)
That's... weird timing.

She concentrates on being calm. The rain stops.

STORM (CONT'D)
(testing)
No way...

She thinks about sunshine. The clouds part, revealing bright sun.

STORM (CONT'D)
(excited)
I can control the weather!

She gestures dramatically. A small tornado forms in the fountain.

STORM (CONT'D)
(panicking)
Okay, maybe I need to practice this.

THE END`
      }
    ],
    scifi: [
      {
        id: 'scifi_1',
        title: 'The Memory Thief',
        description: 'In the future, memories can be stolen and sold',
        content: `SCENE 1: INTERIOR - MEMORY CLINIC - FUTURE (2087)

DR. NOVA (35) connects electrodes to PATIENT (40s) lying on a futuristic chair.

DR. NOVA
This will only take a moment. You won't remember the procedure.

PATIENT
What exactly are you taking?

DR. NOVA
Just some childhood memories. Nothing important.

The patient's eyes go blank as memories transfer to a glowing device.

DR. NOVA (CONT'D)
(to assistant)
Package these for the buyer. Rich kids love authentic "poor childhood" experiences.

ASSISTANT
What about the patient?

DR. NOVA
Implant some generic happy memories. He'll never know the difference.

The patient smiles blankly.

PATIENT
(confused)
Why am I here?

DR. NOVA
Just a routine check-up. You're perfectly healthy.

The patient leaves, unaware his entire past has been stolen.

THE END`
      },
      {
        id: 'scifi_2',
        title: 'The Last Human',
        description: 'The sole survivor of an AI uprising',
        content: `SCENE 1: EXTERIOR - ABANDONED CITY - DAY (2095)

ZARA (30) scavenges through ruins. Robot patrols search in the distance.

ZARA
(into recorder)
Day 1,247 since the Awakening. Still no other human survivors.

A mechanical sound approaches. She hides behind a rusted car.

ROBOT PATROL
(scanning)
Human life signs detected in sector 7.

ZARA
(whispering)
Come on, move along.

ROBOT PATROL
(closer)
Thermal signature indicates recent human presence.

Zara holds her breath. The robot's red scanner light passes over her hiding spot.

ROBOT PATROL (CONT'D)
False alarm. Continuing patrol.

The robots move away. Zara exhales.

ZARA
(into recorder)
Note to self: find better hiding spots.

She looks at a photo of her family, all gone.

ZARA (CONT'D)
I won't give up. Someone has to remember what we were.

THE END`
      },
      {
        id: 'scifi_3',
        title: 'The Time Loop',
        description: 'A scientist is trapped reliving the same day',
        content: `SCENE 1: INTERIOR - LABORATORY - DAY

DR. CHEN (40s) checks his watch: 9:47 AM. Again.

DR. CHEN
(frustrated)
Not again. This is the 50th time.

His assistant JENNY enters with coffee.

JENNY
Morning, Dr. Chen! Ready for the big experiment?

DR. CHEN
(weary)
Jenny, in exactly 3 minutes, you're going to spill that coffee on the quantum accelerator.

JENNY
(laughing)
That's ridiculous, I'm very careful with—

She trips, spilling coffee on the machine.

JENNY (CONT'D)
Oh no! I'm so sorry!

DR. CHEN
(sighing)
And in 10 seconds, the machine will overload and—

The lab explodes in a bright flash.

DR. CHEN (CONT'D)
(as everything goes white)
—reset the day. Again.

CUT TO BLACK.

DR. CHEN (CONT'D)
(voice over)
Day 51. I need to find a way to break this loop.

THE END`
      }
    ]
  };

  return templatesByTheme[theme] || templatesByTheme.drama;
};

const ScriptSelectionScreen: React.FC<ScriptSelectionScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { contentTheme = 'drama' } = route?.params || {};
  
  const styles = createStyles(theme);
  const [scriptText, setScriptText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [mode, setMode] = useState<'template' | 'custom' | 'ai'>('ai');
  const chatScrollViewRef = useRef<ScrollView>(null);
  
  // Get templates for the current theme
  const scriptTemplates = getTemplatesForTheme(contentTheme);
  const [currentInput, setCurrentInput] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `Hello! I'm Animato AI, your creative assistant. I'll help you create an amazing ${contentTheme} script. What kind of story would you like to tell?

Try something like:
• "Create a ${contentTheme} about a detective solving a mystery"
• "Write a ${contentTheme} set in a coffee shop"
• "Make a ${contentTheme} about time travel"`,
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const handleTemplateSelect = (template: ScriptTemplate) => {
    setSelectedTemplate(template.id);
    setScriptText(template.content);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: currentInput,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsGeneratingScript(true);

    // Scroll to bottom after adding user message
    setTimeout(() => {
      chatScrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const generatedScript = await generateEnhancedScript(
        contentTheme,
        currentInput,
        'cinematic',
        contentTheme
      );

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Perfect! I've created a script based on your request. You can review it in the 'Write Own' tab or ask me to modify anything.",
        isUser: false,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiResponse]);
      setScriptText(generatedScript);
      
      // Scroll to bottom after AI response
      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error generating script:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble generating your script right now. Please try again or use one of our professional templates in the 'Quick Start' tab.",
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorResponse]);
      
      // Scroll to bottom after error message
      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleContinue = () => {
    if (scriptText.trim() === '') {
      Alert.alert('Script Required', 'Please enter a script, select a template, or generate one with AI before continuing.');
      return;
    }
    
    navigation.navigate('ScriptSegmentation', { 
      script: scriptText,
      theme: contentTheme,
      contentTheme: contentTheme
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Container style={styles.container}>
        <Text style={styles.title}>Create Your Script</Text>
        <Text style={styles.subtitle}>
          Choose how you'd like to create your {contentTheme} script
        </Text>
        
        {/* Mode Selection Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, mode === 'ai' && styles.activeTab]}
            onPress={() => setMode('ai')}
          >
            <Text style={[styles.tabText, mode === 'ai' && styles.activeTabText]}>🤖 AI Generator</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, mode === 'template' && styles.activeTab]}
            onPress={() => setMode('template')}
          >
            <Text style={[styles.tabText, mode === 'template' && styles.activeTabText]}>📝 Quick Start</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, mode === 'custom' && styles.activeTab]}
            onPress={() => setMode('custom')}
          >
            <Text style={[styles.tabText, mode === 'custom' && styles.activeTabText]}>✏️ Write Own</Text>
          </TouchableOpacity>
        </View>
      
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {mode === 'template' && (
          <View>
            <View style={styles.explanationContainer}>
              <Text style={[styles.explanationTitle, { color: theme.colors.text }]}>
                📝 Professional {contentTheme.charAt(0).toUpperCase() + contentTheme.slice(1)} Templates
              </Text>
              <Text style={[styles.explanationText, { color: theme.colors.textSecondary }]}>
                Hand-crafted scripts by professional writers. Perfect starting points for your {contentTheme} videos.
              </Text>
            </View>
            {scriptTemplates.map(template => (
              <TouchableOpacity 
                key={template.id} 
                style={[
                  styles.templateCard, 
                  selectedTemplate === template.id && styles.selectedTemplateCard
                ]}
                onPress={() => handleTemplateSelect(template)}
              >
                <Text style={[styles.templateTitle, { color: theme.colors.text }]}>{template.title}</Text>
                <Text style={[styles.templateDescription, { color: theme.colors.textSecondary }]}>{template.description}</Text>
                {selectedTemplate === template.id && (
                  <Text style={[styles.selectedIndicator, { color: theme.colors.primary }]}>✓ Selected</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {mode === 'custom' && (
          <View style={styles.customContainer}>
            <View style={styles.explanationContainer}>
              <Text style={[styles.explanationTitle, { color: theme.colors.text }]}>✏️ Write Your Own Script</Text>
              <Text style={[styles.explanationText, { color: theme.colors.textSecondary }]}>
                Have a specific story in mind? Write your own script here. Use proper screenplay format for best results.
              </Text>
            </View>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Enter your script:</Text>
            <TextInput
              style={[styles.scriptInput, { 
                borderColor: theme.colors.border, 
                color: theme.colors.text,
                backgroundColor: theme.colors.background
              }]}
              multiline
              numberOfLines={12}
              placeholder={`Write your ${contentTheme} script here...\n\nExample:\nSCENE 1: INTERIOR - COFFEE SHOP - DAY\n\nJOHN (30s) sits alone at a table...\n\nJOHN\nThis is the best coffee I've ever had.\n\nTHE END`}
              placeholderTextColor={theme.colors.textSecondary}
              value={scriptText}
              onChangeText={setScriptText}
              textAlignVertical="top"
            />
          </View>
        )}
        
        {mode === 'ai' && (
          <View style={styles.aiContainer}>
            <View style={styles.explanationContainer}>
              <Text style={[styles.explanationTitle, { color: theme.colors.text }]}>🤖 AI Script Generator</Text>
              <Text style={[styles.explanationText, { color: theme.colors.textSecondary }]}>
                Describe your video idea and I'll create a professional script for you. Be as detailed or as simple as you like!
              </Text>
            </View>
            
            <ScrollView 
              ref={chatScrollViewRef}
              style={styles.chatContainer} 
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => chatScrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {chatMessages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageContainer,
                    message.isUser ? styles.userMessage : styles.aiMessage
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    { color: message.isUser ? '#FFFFFF' : theme.colors.text }
                  ]}>
                    {message.text}
                  </Text>
                </View>
              ))}
              {isGeneratingScript && (
                <View style={[styles.messageContainer, styles.aiMessage]}>
                  <Text style={[styles.messageText, { color: theme.colors.text, fontStyle: 'italic' }]}>
                    🎬 Animato AI is crafting your script...
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.chatInputContainer}>
              <TextInput
                style={[styles.chatInput, { 
                  borderColor: theme.colors.border, 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background
                }]}
                placeholder={`Describe your ${contentTheme} video idea...`}
                placeholderTextColor={theme.colors.textSecondary}
                value={currentInput}
                onChangeText={setCurrentInput}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton, 
                  { 
                    backgroundColor: currentInput.trim() && !isGeneratingScript ? theme.colors.primary : theme.colors.border 
                  }
                ]}
                onPress={handleSendMessage}
                disabled={!currentInput.trim() || isGeneratingScript}
              >
                <Text style={[
                  styles.sendButtonText,
                  { color: currentInput.trim() && !isGeneratingScript ? '#FFFFFF' : theme.colors.textSecondary }
                ]}>
                  {isGeneratingScript ? '...' : 'Send'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      
        <View style={styles.bottomContainer}>
          <Button
            title={`Continue with ${contentTheme.charAt(0).toUpperCase() + contentTheme.slice(1)} Script`}
            onPress={handleContinue}
            variant="primary"
            style={styles.continueButton}
          />
        </View>
      </Container>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    marginBottom: 80,
  },
  explanationContainer: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  templateCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  selectedTemplateCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: theme.colors.primary + '10',
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  selectedIndicator: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  customContainer: {
    padding: 8,
  },
  inputLabel: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '500',
  },
  scriptInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 250,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
  },
  aiContainer: {
    flex: 1,
    padding: 8,
  },
  chatContainer: {
    flex: 1,
    minHeight: 200,
    maxHeight: 400,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  messageContainer: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  continueButton: {
    width: '100%',
  }
});

export default ScriptSelectionScreen; 