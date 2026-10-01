#import "RCTInterfaceOrientation.h"

#import <UIKit/UIKit.h>

@implementation RCTInterfaceOrientation

+ (NSString *)moduleName
{
  return @"InterfaceOrientation";
}

// UIKit must be read on the main thread.
- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (void)getInterfaceOrientation:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject
{
  UIInterfaceOrientation orientation = UIInterfaceOrientationPortrait;
  for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
    if ([scene isKindOfClass:[UIWindowScene class]]) {
      orientation = ((UIWindowScene *)scene).interfaceOrientation;
      break;
    }
  }
  switch (orientation) {
    // Home indicator on the right → top of the device (island) on the left.
    case UIInterfaceOrientationLandscapeRight:
      resolve(@90);
      break;
    case UIInterfaceOrientationLandscapeLeft:
      resolve(@270);
      break;
    case UIInterfaceOrientationPortraitUpsideDown:
      resolve(@180);
      break;
    default:
      resolve(@0);
  }
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeInterfaceOrientationSpecJSI>(params);
}

@end
