#import <Foundation/Foundation.h>
#import <CineBookSpecs/CineBookSpecs.h>

NS_ASSUME_NONNULL_BEGIN

/// Exposes the current UIWindowScene interface orientation to JS.
/// See src/native/NativeInterfaceOrientation.ts.
@interface RCTInterfaceOrientation : NSObject <NativeInterfaceOrientationSpec>
@end

NS_ASSUME_NONNULL_END
