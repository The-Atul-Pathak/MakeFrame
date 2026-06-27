import type { FrameworkId } from '@/types/framework'

// fromBeatId → array of possible toBeatIds
type BeatMap = Record<string, string[]>

// Canonical STC → X mappings (the source of truth)
const STC_TO_THREE_ACT: BeatMap = {
  opening_image:     ['act1_setup'],
  theme_stated:      ['act1_setup'],
  setup:             ['act1_setup'],
  catalyst:          ['act1_setup'],
  debate:            ['act1_setup'],
  break_into_two:    ['act1_setup'],
  b_story:           ['act2_confrontation'],
  fun_and_games:     ['act2_confrontation'],
  midpoint:          ['act2_confrontation'],
  bad_guys_close_in: ['act2_confrontation'],
  all_is_lost:       ['act2_confrontation'],
  dark_night:        ['act2_confrontation'],
  break_into_three:  ['act3_resolution'],
  finale:            ['act3_resolution'],
  final_image:       ['act3_resolution'],
}

const STC_TO_HEROS_JOURNEY: BeatMap = {
  opening_image:     ['ordinary_world'],
  theme_stated:      ['ordinary_world'],
  setup:             ['ordinary_world'],
  catalyst:          ['call_to_adventure'],
  debate:            ['refusal_of_call'],
  break_into_two:    ['crossing_threshold'],
  b_story:           ['tests_allies_enemies'],
  fun_and_games:     ['tests_allies_enemies'],
  midpoint:          ['ordeal'],
  bad_guys_close_in: ['road_back'],
  all_is_lost:       ['resurrection'],
  dark_night:        ['resurrection'],
  break_into_three:  ['return_with_elixir'],
  finale:            ['return_with_elixir'],
  final_image:       ['return_with_elixir'],
}

const STC_TO_STORY_CIRCLE: BeatMap = {
  opening_image:     ['sc_you'],
  theme_stated:      ['sc_you'],
  setup:             ['sc_you'],
  catalyst:          ['sc_need'],
  debate:            ['sc_need'],
  break_into_two:    ['sc_go'],
  b_story:           ['sc_search'],
  fun_and_games:     ['sc_search'],
  midpoint:          ['sc_find'],
  bad_guys_close_in: ['sc_take'],
  all_is_lost:       ['sc_take'],
  dark_night:        ['sc_return'],
  break_into_three:  ['sc_return'],
  finale:            ['sc_change'],
  final_image:       ['sc_change'],
}

const STC_TO_SEVEN_POINT: BeatMap = {
  opening_image:     ['7p_hook'],
  theme_stated:      ['7p_hook'],
  setup:             ['7p_hook'],
  catalyst:          ['7p_hook'],
  debate:            ['7p_plot_turn_1'],
  break_into_two:    ['7p_plot_turn_1'],
  b_story:           ['7p_pinch_1'],
  fun_and_games:     ['7p_pinch_1'],
  midpoint:          ['7p_midpoint'],
  bad_guys_close_in: ['7p_pinch_2'],
  all_is_lost:       ['7p_pinch_2'],
  dark_night:        ['7p_plot_turn_2'],
  break_into_three:  ['7p_plot_turn_2'],
  finale:            ['7p_resolution'],
  final_image:       ['7p_resolution'],
}

// Invert a BeatMap: for each target beat, list all possible source beats
function invertMap(map: BeatMap): BeatMap {
  const result: BeatMap = {}
  for (const [from, tos] of Object.entries(map)) {
    for (const to of tos) {
      if (!result[to]) result[to] = []
      result[to].push(from)
    }
  }
  return result
}

// Compose X→STC→Y for non-STC cross-conversions
function composeThrough(xToStc: BeatMap, stcToY: BeatMap): BeatMap {
  const result: BeatMap = {}
  for (const [xBeat, stcBeats] of Object.entries(xToStc)) {
    const yBeats = new Set<string>()
    for (const stcBeat of stcBeats) {
      for (const yBeat of stcToY[stcBeat] ?? []) {
        yBeats.add(yBeat)
      }
    }
    if (yBeats.size > 0) result[xBeat] = [...yBeats]
  }
  return result
}

const THREE_ACT_TO_STC = invertMap(STC_TO_THREE_ACT)
const HJ_TO_STC        = invertMap(STC_TO_HEROS_JOURNEY)
const SC_TO_STC        = invertMap(STC_TO_STORY_CIRCLE)
const SP_TO_STC        = invertMap(STC_TO_SEVEN_POINT)

// Full conversion table: [from][to][beatId] → possible target beat IDs
const CONVERSIONS: Partial<Record<FrameworkId, Partial<Record<FrameworkId, BeatMap>>>> = {
  save_the_cat: {
    three_act:      STC_TO_THREE_ACT,
    hero_journey:  STC_TO_HEROS_JOURNEY,
    story_circle:   STC_TO_STORY_CIRCLE,
    seven_point:    STC_TO_SEVEN_POINT,
  },
  three_act: {
    save_the_cat:   THREE_ACT_TO_STC,
    hero_journey:  composeThrough(THREE_ACT_TO_STC, STC_TO_HEROS_JOURNEY),
    story_circle:   composeThrough(THREE_ACT_TO_STC, STC_TO_STORY_CIRCLE),
    seven_point:    composeThrough(THREE_ACT_TO_STC, STC_TO_SEVEN_POINT),
  },
  hero_journey: {
    save_the_cat:   HJ_TO_STC,
    three_act:      composeThrough(HJ_TO_STC, STC_TO_THREE_ACT),
    story_circle:   composeThrough(HJ_TO_STC, STC_TO_STORY_CIRCLE),
    seven_point:    composeThrough(HJ_TO_STC, STC_TO_SEVEN_POINT),
  },
  story_circle: {
    save_the_cat:   SC_TO_STC,
    three_act:      composeThrough(SC_TO_STC, STC_TO_THREE_ACT),
    hero_journey:  composeThrough(SC_TO_STC, STC_TO_HEROS_JOURNEY),
    seven_point:    composeThrough(SC_TO_STC, STC_TO_SEVEN_POINT),
  },
  seven_point: {
    save_the_cat:   SP_TO_STC,
    three_act:      composeThrough(SP_TO_STC, STC_TO_THREE_ACT),
    hero_journey:  composeThrough(SP_TO_STC, STC_TO_HEROS_JOURNEY),
    story_circle:   composeThrough(SP_TO_STC, STC_TO_STORY_CIRCLE),
  },
}

export function getConversionTargets(
  fromFramework: FrameworkId,
  toFramework: FrameworkId,
  beatId: string
): string[] {
  if (fromFramework === toFramework) return [beatId]
  return CONVERSIONS[fromFramework]?.[toFramework]?.[beatId] ?? []
}
