/// //////////////////////////////////////////////////////////////////////
// Fetch threads information used by Messenger native API. But this API //
// cannot get Messages.                                                 //
/// //////////////////////////////////////////////////////////////////////
import { graphql, getMessengerApiForm } from './util'

export const COLORS = {
  '#0084ff': 'Messenger Blue',
  '#44bec7': 'Viking',
  '#ffc300': 'Golden Poppy',
  '#fa3c4c': 'Radical Red',
  '#d696bb': 'Shocking',
  '#6699cc': 'Picton Blue',
  '#13cf13': 'Free Speech Green',
  '#ff7e29': 'Pumpkin',
  '#e68585': 'Light Coral',
  '#7646ff': 'Medium Slate Blue',
  '#20cef5': 'Deep Sky Blue',
  '#67b868': 'Fern',
  '#d4a88c': 'Cameo',
  '#ff5ca1': 'Brilliant Rose',
  '#a695c7': 'Biloba Flower'
  // '#000000': 'Black' // Defined in Messenger page, but unuseful.
}

export default function formatParticipant (jar, thread, newColor) {
  console.log(newColor)
  const formData = {
    thread_or_other_fbid: thread.id
  }
  // If no new color set, Messenger will set to default color(Messenger Blue).
  if (newColor) {
    formData['color_choice'] = newColor.toLowerCase()
  }
  const form = getMessengerApiForm(formData, jar)
  return graphql('https://www.messenger.com/messaging/save_thread_color/?source=thread_settings&dpr=1', form)
}
