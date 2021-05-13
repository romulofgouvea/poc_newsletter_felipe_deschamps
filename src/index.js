import {
  RobotScrapy,
  RobotImages,
  RobotPubInstagram,
} from "~/controller";

const Index = async () => {
  await RobotScrapy.RobotScrapy();
  await RobotImages.RobotImages();
  await RobotPubInstagram.RobotPubInstagram();
};

Index();
