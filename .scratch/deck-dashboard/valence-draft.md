# Valence/Impact draft classification

deck-dashboard #17. Draft ratings for all 50 fear + 65 event cards, classified from the card
images against [`valence-rubric.md`](valence-rubric.md). **Nothing here is merged** — this is
the reviewable table for [#18](issues/18-valence-ratification.md); the owner amends any row
before it lands on `other-cards.json`. The `Flag` column marks a cross-check anomaly against
the card's existing `tags`/`eventClass` (never used as a rating input, only as a sanity check)
for the owner's attention — an unflagged row isn't automatically correct, just unremarkable.

## Fear — Impact (1 weak / 2 solid / 3 strong)

| Name | Impact | Justification | Flag |
|---|---|---|---|
| Angry Mobs | 2 | Scales from a per-player Explorer swap up to killing 1 Invader per 2 Explorers in every land with 2+ Explorers — broad but conditional on Explorer buildup. | |
| Avoid the Dahan | 2 | Denies Explore/Build in Dahan-heavy lands board-wide at tier III, a reliable board-wide slow rather than a removal effect. | |
| Belief Takes Root | 2 | Defend 2 wherever Presence sits, scaling at III to each player stripping up to 2 Health of Invaders per Presence in a chosen land — solid, not board-sweeping. | |
| Beset by Many Troubles | 3 | Tier III converts every terrain/Presence token into Defend 3 in its land and all adjacent lands, a huge board-wide defensive blanket. | |
| Civil Unrest | 3 | Tier III adds a Blight to every board and deals damage to every Invader per Blight it holds — a board-wide, scaling debuff. | |
| Communities in Disarray | 1 | Only reduces Ravage damage from Towns/Cities by 1-2, a narrow scaling debuff with no removal or wide board presence — the rubric's own weak example. | |
| Dahan Attack | 2 | Grows from removing 1 Explorer per player to gathering and dealing 2 damage per Town/City per player — solid, multi-land removal/damage but capped by player count. | |
| Dahan Enheartened | 2 | Displaces/gathers Dahan into Invader lands then deals 1 damage per Dahan present, a moderate, reliable but not overwhelming disruption. | |
| Dahan Gain the Edge | 2 | Each player's chosen Dahan land gets Defend + up to 2 damage at tier III — solid, dependable, capped by player count. | |
| Dahan on their Guard | 2 | Board-wide Defend scaling with Dahan count (up to Defend 2 per Dahan at III), a dependable universal defensive boost. | |
| Dahan Raid | 1 | Only 1-2 damage in one Dahan land per player, a narrow single-land effect even at tier III. | |
| Dahan Reclaim Fishing Grounds | 1 | Restricted to Coastal lands with Dahan, dealing at most 1-2 damage per Dahan per player — narrow terrain/type condition limits impact. | |
| Dahan Threaten | 2 | Adds Blight into Dahan lands and at tier III deals 1 damage per Town/City in every land with Blight — a dependable, moderately scaling debuff. | |
| Daunted by the Dahan | 3 | Board-wide Defend 3 in Dahan lands, -6 Ravage damage to Dahan per land, and at III isolates every Dahan land — a massive multi-board defensive swing. | |
| Demoralized | 2 | Simple flat Defend (1/2/3) across all lands — dependable universal mitigation without a standout swing. | |
| Depart the Dangerous Land | 2 | Removes Explorers from Mountain/Wetland/high-Presence lands, scaling to 4 Health of Invaders removed per player at III — solid, multi-condition removal. | |
| Depopulation | 2 | Board-wide Town-to-Explorer downgrade scaling to full Town/City removal per board at III — dependable, moderate-to-strong but capped at one per board. | |
| Discord | 2 | Adds Blight to multi-Invader lands and at III lets Blighted Invaders damage each other — a reliably useful, scaling but not sweeping debuff. | |
| Distracted by Local Troubles | 1 | Deals only 1-2 damage per board tied to lands matching a Ravage Card, a narrow, conditional pinprick even at tier III. | |
| Emigration Accelerates | 2 | Removes 1 Explorer/Town per player from Coastal (then any) land, scaling to any land at III — solid, dependable but capped by player count. | |
| Explorers are Reluctant | 2 | Skips an Explore card board-wide and at III skips normal Explore while still revealing — reliably slows invaders a turn without a huge swing. | |
| Fear of the Unseen | 2 | Removes 1 Explorer/Town per player from Sacred Site/Wetland lands, escalating to Town removal at III — solid multi-condition removal. | |
| Flee from Dangerous Lands | 3 | Tier III lets each board remove 1 unit from any land or a City from a wide terrain set — City removal board-wide is a strong swing. | |
| Flee the Pestilent Land | 2 | Removes up to 5 Health of Invaders per player from Wetland (or 1 unit Inland) lands at III — solid, dependable multi-Health removal. | |
| Immigration Slows | 2 | Skips/freezes the Build card board-wide for a turn, a dependable slow on invader growth without being a removal blowout. | |
| Isolation | 1 | Even at III only removes 1 invader per land capped at 2-or-fewer-invader lands, per player, per board — narrow and self-limiting. | |
| Mimic the Dahan | 2 | Removes/replaces one invader per land (2+ Dahan) each tier, scaling to a wide "adjacent to 3+ Dahan" condition at III — dependable but per-land. | |
| Nerves Fray | 1 | Only adds Damage tokens (no removal/weaken text) to a single land not matching Ravage, plus a small 1-per-player effect at III — narrow, single-land. | |
| Overseas Trade Seem Safer | 2 | Solid Defend values (up to 9) across all Coastal lands plus a Build-block at II/III — reliable multi-land defense, not a blowout swing. | |
| Panic | 2 | Adds Damage and reduces invader Health board-wide at II/III — classic dependable weaken, scales but never removes bulk invaders outright, matching the rubric's own solid example. | |
| Panicked by Wild Beasts | 2 | Adds Damage plus skips Explore/Build (II) or all Actions (III) in Beast lands/adjacent — meaningful tempo loss across a spreading zone. | |
| Plan for Departure | 1 | Small Gather (1-2 pieces) plus modest Defend (2-4) in Coastal lands only — a narrow, low-magnitude defensive tool. | ratified — owner: nice tag combination but relatively weak given the Coastal-only restriction |
| Quarantine | 2 | Blocks Explore in Coastal lands and, at III, stops invader Actions entirely in Ocean-adjacent lands — reliable board-wide tempo denial. | |
| Restlessness | 2 | Pushes, then at III removes up to 3 invaders from a single land not matching Build — solid single-land chunk removal each game. | |
| Retreat! | 2 | Pushes up to 2-3 Explorers/Towns from one Inland land, and at III pushes any number from one land — a dependable single-land tempo swing. | |
| Scapegoats | 2 | Towns/Cities destroy Explorers in their land, scaling to destroying all Explorers where Towns/Cities exist at III — solid chip damage tied to invader presence. | |
| Seek Company | 1 | Only gathers invaders into denser lands (up to 4 total at III) — repositions rather than removes, a narrow tempo nudge at best. | |
| Seek Safety | 2 | Pushes/gathers invaders into safer lands, culminating in removing up to 3 Health worth of invaders at III — a moderate, reliable setback. | |
| Sense of Dread | 2 | Removes one invader per board from a Ravage-matching land each tier — dependable single-target removal on every board every game. | |
| Spreading Timidity | 2 | Isolates a land per player and adds Defend 2-4 at higher tiers — a reliable multi-land tempo/defense effect that scales with player count. | |
| Struggles over Farmland | 1 | Only adds Damage tokens near Dahan, with a minor internal-damage effect at III — narrow, conditional on Dahan presence, low direct magnitude. | |
| Supply Chains Abandoned | 2 | Isolates one land (two at III) and blocks Build actions there — solid, dependable tempo denial across multiple boards. | |
| Tall Tales of Savagery | 3 | At III removes 2 Explorers/1 Town from every Dahan land AND removes a Town/City from every land with 2+ Dahan — wide multi-land removal, matching the rubric's own strong example pattern. | |
| Theological Strife | 1 | Only adds Damage tokens to Ocean-adjacent lands; the III effect (invader self-damage) is conditional and small in most games. | |
| Too Many Monsters | 3 | At III removes 2 Explorers and 2 Towns/Cities from every land with/adjacent to Wilds — the rubric's canonical strong example. | |
| Trade Suffers | 1 | Blocks Building in City-lands, then only lets players swap a Town for an Explorer in one Coastal land — narrow, low-magnitude tempo effect. | |
| Tread Carefully | 1 | Only prevents Ravage in a single chosen land per player — a defensive skip, not removal/weaken, small in scope even at III. | |
| Unrest | 2 | Adds Damage to a Town and shrinks invader Health board-wide at II/III — a dependable, moderate debuff mirroring Panic. | |
| Unsettled | 2 | Downgrades or removes an invader per board in a Beast/Damage/Dahan land, scaling to guaranteed removal or Build-skip at III — solid, reliable multi-board effect. | |
| Wary of the Interior | 1 | Removes only 1 invader from one Inland (then any) land per player — a single, small-scale removal with no board-wide reach. | |

## Event — Valence (harmful / mixed / beneficial)

| Name | Valence | Justification | Flag |
|---|---|---|---|
| A Strange Madness among the Beasts | mixed | "Guide the Madness" lets Spirits pay Energy to protect and reposition Beasts (favorable if paid); "Let them Rampage" removes Beasts but destroys Dahan — a real cost/benefit trade-off. | |
| Accumulated Devastation | harmful | Healthy side amplifies Ravage damage by Invader Stage; Blighted side adds Blight, with only a costly Dahan-based mitigation, not a real upside — both branches cost the players. | |
| An Ominous Dawn | mixed | Depends on how many Power Cards in play generate Fear thresholds — Stage I removes Invader health, Stage II/III adds Fear cards, so it swings with board/deck state rather than favoring one side. | |
| Bureaucrats Adjust Funding | mixed | With many Towns/Cities, Build Cards skip a land (favorable); with few, it causes extra Builds (unfavorable) — the two thresholds pull opposite directions depending on board state. | |
| Cities Rise | harmful | Healthy side upgrades Towns to Cities (invader advancement) and Blighted side makes Blight easier to add — both branches worsen the invaders' position for players. | |
| Civic Engagement | harmful | Healthy side removes a Dahan or increases Ravage damage (harmful either way); Blighted side only triggers a further Blight add on high-Blight boards — no branch favors the players. | ratified — owner agreed, amended from mixed |
| Coastal Towns Multiply | harmful | Healthy side adds a Town, Blighted side adds Ravage damage where there's no Dahan — both branches straightforwardly favor the invaders. | |
| Cultural Assimilation | harmful | Healthy side converts a Dahan into an Explorer, Blighted side does direct damage to Dahan ignoring Defend — both branches directly hurt the players' Dahan presence. | ratified — owner confirmed harmful |
| Dahan Trade with the Invaders | mixed | Free option pauses Dahan participation; the two paid options trade Energy/Power Cards for either generating Fear or gaining permanent Dahan Defend — a genuine cost/benefit choice. | |
| Distant Exploration | harmful | Stage I extends Explore range, Stage II/III adds heavy Ravage damage — both thresholds harm players with no favorable branch. | ratified — owner agreed, amended from mixed |
| Eager Explorers | harmful | Stage I adds an Explorer after a Build; Stage II/III shifts damage from land to Dahan where present — both thresholds harm players with no favorable branch. | ratified — owner agreed, amended from mixed |
| Ethereal Conjunction | mixed | "Endure" costs a Sacred Site and Energy while "Seek to Control" grants a free extra Power Card use but discards the hand — a genuine risk/reward trade-off. | |
| Far-Off Wars Touch the Island | mixed | Adds a Fear card (favorable) but then forces a choice between heavy Invader/Blight escalation or destroying only one Town with no Fear gain — trades Fear gain against Blight/Invader growth. | |
| Farmers Seek the Dahan for Aid | mixed | "Spurn" damages Dahan and adds Blight but weakens Invaders; "Teach" adds a Town but converts a future Ravage into a Build — a genuine two-sided trade-off. | |
| Focused Farming | harmful | Healthy side adds both an Explorer and a Town; Blighted side forces Spirits to Forget a Power Card or lose Energy/Sacred Site — both branches cost the players. | |
| Fortune-Seekers | harmful | Healthy side redirects the next Explore Card to match all non-Town/City lands (net-harmful even where swingy by layout); Blighted side only makes Blight easier without Dahan present — no branch favors the players. | ratified — owner agreed, amended from mixed |
| Gradual Corruption | harmful | Healthy side adds Blight, avoidable only at an Energy cost; Blighted side's Beast/Wilds cleanup is too minor to count as a real favorable branch — nets harmful. | ratified — owner agreed, amended from mixed |
| Hard-Working Settlers | mixed | "Act Cautiously" adds an Explorer and forces an extra Ravage; "Create Unnerving Distractions" skips Ravages and removes Stage II/III cards from the deck at the cost of Fear — a genuine high-stakes trade. | |
| Harvest Bounty, Harvest Dust | harmful | Healthy-island forces an extra Ravage; Blighted-island pushes a Town off the board only if already saturated (a wash at best); Stage III adds Blight unless Spirits pay a heavy token cost — nets harmful. | ratified — owner confirmed harmful |
| Heavy Farming | harmful | Healthy side boosts Ravage damage from Towns; Blighted side adds Blight, preventable only by destroying Wilds/Sacred Sites — both branches cost the players. | |
| Influx of Settlers | mixed | Healthy side adds multiple Explorers (harmful); Blighted side skips a Ravage — a real, meaningful benefit — bundled with a Blight add on the same board, a genuine trade-off. | ratified — owner agreed, amended from harmful |
| Interesting Discoveries | harmful | Stage I gathers and adds Explorers; Stage II/III increases all Ravage damage — both stages advance the invasion with no favorable branch. | |
| Invaders Surge Inland | harmful | Healthy branch pushes an Explorer further inland; Blighted branch adds a Town/City near existing Invaders — both branches advance the invasion, the rubric's own harmful example. | |
| Invested Aristocracy | harmful | Stages I/II add an Explorer to the highest empty land; Stage III does +2 Ravage damage (healthy) or drops a Fear Card on the deck (blighted, at best neutral) — no branch favors players. | |
| Investigation of Dangers | harmful | Terror I adds an Explorer to an empty/undefended land; Terror II/III gives Invaders +3 damage per Blighted land — both tiers strengthen the invasion. | |
| Lesser Spirits Imperiled | mixed | "Tend to Your Own Strength" gives cheap energy/blight-removal, while "Forge a Web of Mutual Support" costs each Spirit a Presence and Energy for a permanent Element — a real cost-vs-benefit trade-off. | |
| Life's Balance Tilts | mixed | Trades a beast/disease swap plus -1 Health to Invaders and Dahan against the mirrored +1 Health to both — each option helps in one respect and hurts in another. | |
| Mapmakers Chart the Wild | harmful | Stages I/II add an extra Explorer per successful Explore; Stage III gives Invaders +1 Ravage damage per land — both tiers only benefit the invasion. | |
| Missionaries Arrive | mixed | Converting a Dahan to a Town/pushing Dahan (Option A) vs. paying Energy to add Blight and boost the next Ravage in exchange for extra Fear (Option B) — genuine trade-off, no dominant option. | |
| New Species Spread | mixed | A chance to add Blight near Towns/Cities (Option A) vs. paying Energy for guaranteed Fear but also guaranteed Blight (Option B) — both cost and gain something. | |
| No Bravery without Numbers | mixed | Suppressing Ravages unless Invaders outnumber Terror Level is a real benefit only when Terror is high; when Terror is low, Stage III's added Ravage damage lands in full — outcome swings on Terror Level. | ratified — owner confirmed mixed |
| Numinous Crisis | mixed | "Draw Strength" purely benefits players (removes Blight, gains Energy); "Pour Your Strength" costs real resources and adds Blight — a genuine two-sided choice. | |
| Outpaced | mixed | Per-Spirit choice between discarding a Slow power for a small refund vs. paying Energy/Presence to resolve it early — a real resource trade-off with no dominant option. | |
| Overconfidence | harmful | Terror I discards earned Fear Cards or stockpiles Fear markers; Terror II/III scales Invader Ravage damage directly with the earned-Fear pile — consistently punishes prior progress. | |
| Population Rises | mixed | Healthy branch adds a Town near an Explorer/Town (harmful); Blighted branch lets each Spirit optionally remove a Blight for free (beneficial) — genuinely board-state dependent. | ratified — owner confirmed mixed |
| Promising Farmland | harmful | Healthy branch upgrades an Explorer straight to a Town during Explore; Blighted branch forces an extra Ravage in untouched terrain, preventable only at a Presence cost — both branches advance Invaders. | |
| Provincial Seat | harmful | Healthy branch Builds in a Town's land (adds a City); Blighted branch adds Blight to an undefended land — both branches straightforwardly favor Invaders. | |
| Pull Together in Adversity | mixed | Terror I/II denies players a Fear-related benefit (harmful); Terror III trades removing all Towns from a crowded land (beneficial) against adding Blight and reshaping terrain (harmful) — swings with Terror Level and board state. | ratified — owner confirmed mixed |
| Putting down Roots | harmful | Healthy branch upgrades an Explorer to a Town inland; Blighted branch adds Blight to an inland land with Invaders, preventable only at a 3-Presence cost — both branches favor Invaders. | |
| Relentless Optimism | mixed | Terror I denies players Fear from destroying Towns/Cities (harmful); Terror II/III's Dahan/Invader ratio swap can go either direction depending on which side currently outnumbers the other — a genuine, board-dependent swing. | ratified — owner confirmed mixed |
| Remnants of a Spirit's Heart | mixed | A big temporary Dahan Health buff (with a small Invader Health cost) versus a Defend-4 investment that weakens this turn's Spirit defense first — a genuine short-term-vs-long-term trade-off. | |
| Resourceful Populace | harmful | Terror I re-adds a Town/City adjacent to wherever one was just destroyed, undercutting the kill; Terror II/III gives Towns +1 Ravage damage and adds Blight after Ravaging, with only a minor consolation removal — invader-favoring effects dominate both tiers. | |
| Rising Interest in the Island | mixed | Removing a card from the Invader deck but adding an Explorer (Option A); paying Energy to discard a Fear Card and grant Invaders +1 Ravage damage (Option B) — both options mix a benefit with a real cost. | |
| Sacred Sites under Threat | mixed | Relocating Invaders and removing Blight, net beneficial but low-impact (Option A); paying Energy to either damage Invaders or force each Spirit to destroy Presence (Option B) — a genuine choice between a mild guaranteed gain and a costlier, riskier one. | |
| Search for new Lands | harmful | Healthy branch pushes an Explorer to spread invaders; Blighted branch adds a City to every board with invaders — no player-favoring branch. | |
| Search for Unclaimed Land | harmful | Healthy branch Explores (adds an Explorer); Blighted branch either does +2 damage or destroys Dahan — both branches cost the players. | |
| Seek New Farmland | harmful | Healthy branch spreads Towns to new lands; Blighted branch adds a Blight card to a Town land — both advance the invasion. | |
| Seeking the Interior | harmful | Stage I pushes an Explorer inland; Stages II+III push Explorers/Towns outward from the most-invaded land — both stages spread invaders with no player upside. | |
| Slave Rebellion | beneficial | Both stages only ever add Fear and then damage/destroy Invaders that carry it — the rubric's own beneficial example. | |
| Smaller Ports Spring Up | harmful | Stage I+II adds a Town to a coastal land; Stage III Builds in an unmatched land — both stages advance the Invaders. | |
| Sprawl Contained by the Wilds | mixed | Healthy branch simultaneously adds a Dahan (good) and Builds in the busiest land (bad); Blighted branch forces every Spirit into a genuine lose-lose trade (destroy Presence vs. lock Powers to Innate) — net effect swings on board state. | ratified — owner confirmed mixed |
| Strange Tales attract Explorers | harmful | Stage I's minor Fear gain is outweighed by adding an Explorer to every Dahan land; Stages II+III Build in an unrepresented terrain — both stages net-advance the Invaders. | |
| Temporary Truce | beneficial | Both Terror levels exempt Dahan-heavy lands from Ravage or skip a Ravage Action outright — pure damage reduction for the players. | |
| Terror Spikes Upwards | mixed | Lower Terror levels just add Fear (good) or bump a Fear Card's resolution (variable); Final Harvest trades harsher Ravage damage for removing an Invader piece per Ravage Action after — the net swings with which Terror level is active. | |
| The Frontier Calls | harmful | Healthy branch buffs Explore Actions (more Explorers); Blighted branch costs every Spirit Presence to delay Blight-card depletion — both cost the players even with a delayed upside. | |
| The Struggles of Growth | mixed | Healthy branch is a genuine even trade for each Spirit (Presence-for-Power-Card vs. Power-Card-for-Energy-and-move); Blighted branch's Blight addition is preventable by destroying Presence — outcome depends on board state and Spirit choices. | ratified — owner confirmed mixed |
| Thriving Trade | harmful | Healthy branch adds a Town to a Town-heavy coastal land; Blighted branch adds a Blight card once 4+ lands have Towns — both advance the Invaders. | |
| Tight-Knit Communities | harmful | Healthy branch gives Towns/Cities +1 Health (tougher Ravage); Blighted branch spreads Blight adjacent to existing Blight — both branches favor the Invaders. | |
| Urban Development | harmful | Healthy branch gives Towns/Cities +2 Ravage damage; Blighted branch adds Blight to an already-Blighted land — both branches hurt the players. | |
| Visions Out of Time | mixed | Losing Energy to swap a Power Card now, or banking a delayed Ravage-plus-Fear cost via an Omen token — a genuine trade-off, matching its choice class. | |
| War Touches the Island's Shores | mixed | "Allow the Attacks" discards a Major Power to damage Invaders/land while "Help Repel the Newcomers" spends Energy to add a Fear Card — a real cost-for-benefit trade either way. | |
| Wave of Reconnaissance | harmful | Stage I adds an extra Explorer per Exploration; Stages II+III upgrade Explorers into Towns — both stages accelerate the Invasion. | |
| Well-Prepared Explorers | harmful | Healthy branch gives Explorers +1 Health (harder to kill); Blighted branch spreads Blight adjacent to existing Blight — both branches favor the Invaders. | |
| Wounded Lands Attract Explorers | mixed | Healthy branch adds an Explorer to a Blighted land (bad); Blighted branch removes Blight from the Blight Card back to the box (good, delaying the Blight-card loss condition) — the two branches pull in opposite directions. | ratified — owner confirmed mixed |
| Years of Little Rain | mixed | The rubric's own mixed example — a real drought trade-off between letting things wither now (cheap, harmful) vs. paying Energy to ease it (costly, beneficial). | |

## Cross-check summary

16 of 115 rows were originally flagged for owner attention: 1 fear card (a
`defensive`+`displacement`-tagged card drafted weak, an unusual tag/rating combination) and 15
event cards — all `terrorLevel` or `healthyBlightedLand` (non-`choice`) cards drafted **mixed**,
flagged because one of their two branches may read more one-sidedly (harmful or beneficial)
than the draft credited it.

**All 16 flagged rows ratified.**
- **Plan for Departure** — confirmed weak (1); the Coastal-only restriction caps the effect
  despite the disruptive tag pair.
- Amended from mixed to **harmful**: **Civic Engagement**, **Distant Exploration**,
  **Eager Explorers**, **Fortune-Seekers**, **Gradual Corruption** — neither branch actually
  favors the players on any of these five.
- Amended from harmful to **mixed**: **Influx of Settlers** — skipping a Ravage is a real,
  meaningful benefit even bundled with a Blight add.
- Confirmed as originally drafted: **Cultural Assimilation** (harmful), **Harvest Bounty,
  Harvest Dust** (harmful), **No Bravery without Numbers**, **Population Rises**, **Pull
  Together in Adversity**, **Relentless Optimism**, **Sprawl Contained by the Wilds**,
  **The Struggles of Growth**, **Wounded Lands Attract Explorers** (all mixed).

**Still open** — the 99 unflagged rows have not been reviewed row-by-row; full ratification per
[#18](issues/18-valence-ratification.md) still requires the owner to confirm all 115 rows
before anything lands on `other-cards.json`.
