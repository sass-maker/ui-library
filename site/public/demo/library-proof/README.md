# Tab sizing evidence

Original browser screenshots of this library, retained without pixel edits.
Both use Chromium at390px, Paper/light, coarse pointer and reduced motion.
The example viewport below clips the same tab-bar area at the same CSS scale.

- Before: source `fbab51fa48fc44b270b0e8006d25430c42453ea1`.
- After: the working repair incorporated in `644e8a68fccfa9811bbfafa3b7d2bb4e59f8f453`.
- Observed selected pill77.25px →101.359375px; label83.359375px; touch height44px.

These are example-specific captured geometry, not a performance benchmark.
Original UI-library work, under the repository license.
