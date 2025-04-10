The MIDI standard for a continuous controller sends 7-bit data - 0-127.

"High resolution" CC data can send 14-bit data (0-16384).

However: **support for this is very limited**. _If_ you know you need it or can use it, go ahead, it'll work. Both Ableton and Bitwig support this automatically - map a controller to a high-resolution MIDI output and it will automatically realise it's 14-bit.

If you think it sounds cool, but don't know if your instruments or tools support it: you probably want to send standard 7-bit data. **Don't just click high resolution because it sounds better.** Unless you know it'll work, it might have unintended consequences.

#### How high-resolution CCs work

The 14 bits of data are split into two chunks, MSB/LSB style: one 7-bit chunk for bits 8-14, and one for bits 1-7. The higher significant chunk is sent on continuous controller number `x`; the lower significant chunk is sent on `x+32`. For instance, if you set a controller to send high-res data on CC `32` in the editor above, you'll send the higher chunk on CC `32` and, simultaneously, the lower chunk on CC `64`. (This is why you should only use this feature if you think you need it: otherwise, you're going to be sending extra CCs you might not want.)

#### Doesn't my device have an ADC with less than 14 bits?

The RP2040 in 16nx devices only has a 12-bit ADC, and so the firmware actually multiples the read analog value by 4 (or left shifts it by 2, really) to get a 14-bit number. So yes, we don't have 14 "real" usable bits of data.

But: a 12-bit ADC probably doesn't have _12_ usable bits of data, really; one you filter out noise and jitter, you probably are working with 10 usable bits of data (ie: if you /4 or >> 2, you will filter out a lot of unwanted noise).

But regardless: 10 usable bits - 0-1023 - is _still_ better than 0-127. So there's an advantage to using this, if it's available to you.
