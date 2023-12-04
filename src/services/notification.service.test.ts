import {connect, sendSampleMessage} from './notification.service'

export const notificationService = async() => {
  console.log("testing notification service");
  await connect();
  await sendSampleMessage();
}

