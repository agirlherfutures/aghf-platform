"""Second-person pass for quiz/fact wording (the 'who's trading' character columns stay as written)."""
import json, re, sys
OUT = '/home/user/aghf-platform/agihf/lessons-data'
SUBS = [
 ("in her window", "in your window"), ("for her tested plan", "for your tested plan"), ("Nothing scheduled in her window", "Nothing scheduled in your window"),
 ("· her window", "· your window"), ("Typical for her plan", "Typical for your plan"), ("Her news rule", "Your news rule"), ("her news rule", "your news rule"),
 ("She’s calm", "You’re calm"), ("inside her 5-minute window", "inside your 5-minute window"), ("by her rule", "by your rule"),
 ("Her state did", "Your state did"), ("She didn’t chase", "You didn’t chase"), ("she missed money", "you missed money"),
 ("Mid-session she believes her max should be 3. What does she do?", "Mid-session you believe your max should be 3. What do you do?"),
 ("Her saved rule prohibits", "Your saved rule prohibits"), ("Her rule blocks", "Your rule blocks"), ("She has NO news rule defined", "You have NO news rule defined"),
 ("She entered before Continuation", "You entered before Continuation"), ("She chased after missing a winner", "You chased after missing a winner"),
 ("her IF / THEN response", "your IF / THEN response"), ("Her personality", "Your personality"), ("Her P&L", "Your P&L"), ("Her risk limit is 1R", "Your risk limit is 1R"),
 ("but her environment rule blocks", "but your environment rule blocks"), ("PASS under her plan", "PASS under your plan"), ("outside her participation rules", "outside your participation rules"),
 ("She’s calm and confident", "You’re calm and confident"), ("Take it, she feels great", "Take it, you feel great"), ("far beyond her usual", "far beyond your usual"),
 ("Elevated vs her plan", "Elevated vs your plan"), ("Her saved news rule decides", "Your saved news rule decides"), ("Her window ends", "Your window ends"),
 ("Her window is closed", "Your window is closed"), ("She took no trades and broke no rules", "You took no trades and broke no rules"),
 ("Her rulebook still allows it", "Your rulebook still allows it"), ("Let her reason from her own framework", "Let you reason from your own framework"),
 ("with her thoughts, her rulebook,", "with your thoughts, your rulebook,"), ("Mid-session she thinks her max trades should be 3. What does she do?", "Mid-session you think your max trades should be 3. What do you do?"), ("after her window", "after your window"),
 ("She wants to trade", "You want to trade"), ("Psychological readiness", "Feeling ready"),
]
for name in sys.argv[1:]:
    p = f'{OUT}/{name}'
    s = open(p, encoding='utf-8').read()
    for a, b in SUBS:
        s = s.replace(a, b)
    json.loads(s)
    open(p, 'w', encoding='utf-8').write(s)
    print('voiced', name)
