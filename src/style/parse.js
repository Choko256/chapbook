import color from '../author/color';

export function autopx(value) {
	if (typeof value === 'number') {
		return value + 'px';
	}

	return value;
}

export function parseColor(source) {
	let result = {color: 'inherit', 'background-color': 'inherit'};
	const bits = source.split(/ on /i);

	result.color = color(bits[0].trim().toLowerCase()).toString();

	if (bits.length === 2) {
		result['background-color'] = color(
			bits[1].trim().toLowerCase()
		).toString();
	}

	return result;
}

export function parseFont(source) {
	let result = {
		'font-family': 'inherit',
		'font-size': 'inherit',
		'font-style': 'inherit',
		'font-weight': 'inherit',
		'letter-spacing': 'inherit',
		'text-decoration': 'inherit',
		'text-transform': 'inherit'
	};

	function applyFonts(result, fontSrc) {
		result['font-family'] = fontSrc
			.split('/')
			.map(font => {
				let out = font;
				if (out[0] !== '"') {
					out = '"' + out;
				}
				if (out[out.length - 1] !== '"') {
					out = out + '"';
				}
				return out;
			})
			.join(',');
	}

	function applyBold(result) {
		result['font-weight'] = 'bold';
	}

	function applyItalic(result) {
		result['font-style'] = 'italic';
	}

	function applyRoman(result) {
		result['font-style'] = 'none';
		result['font-weight'] = 'normal';
		result['letter-spacing'] = 'normal';
		result['text-decoration'] = 'none';
		result['text-transform'] = 'none';
	}

	function applySmallCaps(result) {
		result['letter-spacing'] = '0.075em';
		result['text-transform'] = 'uppercase';

		if (result['font-size']) {
			result['font-size'] = `calc(0.7 * ${result['font-size']})`;
		} else {
			result['font-size'] = '70%';
		}
	}

	function applyUnderline(result) {
		result['text-decoration'] = 'underline';
	}

	const sizeMatch = /\b\d+(ch|cm|ex|in|mm|pc|pt|px|r?em|vh|vmax|vmin|vw|%)?/i.exec(
		source
	);

	if (sizeMatch) {
		// If the font size has no unit, assume px.

		if (/^\d+$/.test(sizeMatch[0])) {
			result['font-size'] = sizeMatch[0] + 'px';
		} else {
			result['font-size'] = sizeMatch[0];
		}

		// Everything in front of the size is a font.

		if (sizeMatch.index !== 0) {
			applyFonts(result, source.substr(0, sizeMatch.index).trim());
		}

		// Everything afterwards modifies it.

		const modifiers = source.substr(sizeMatch.index);

		if (/\broman\b/i.test(modifiers)) {
			result['font-style'] = 'none';
			result['font-weight'] = 'normal';
			result['letter-spacing'] = 'normal';
			result['text-decoration'] = 'none';
			result['text-transform'] = 'none';
		} else {
			if (/\bbold\b/.test(modifiers)) {
				applyBold(result);
			}

			if (/\bitalics?\b/.test(modifiers)) {
				applyItalic(result);
			}

			if (/\bunderlined?/.test(modifiers)) {
				applyUnderline(result);
			}

			if (/\bsmall caps?\b/.test(modifiers)) {
				applySmallCaps(result);
			}
		}
	} else {
		// We are looking at a mixture of font names and modifiers.
		// Because modifiers would come last, we handle those cases first.

		let modMatch;
		let trimmedSource = source;

		// Because of fonts like Times New Roman, we have to be case-sensitive
		// when searching for modifiers.

		while (
			(modMatch = /(bold|italics?|roman|small caps|underlined?)$/.exec(
				trimmedSource
			))
		) {
			console.log(`saw ${modMatch[0]} in "${trimmedSource}"`);

			switch (modMatch[0]) {
				case 'bold':
					applyBold(result);
					break;

				case 'italic':
				case 'italics':
					applyItalic(result);
					break;

				case 'roman':
					applyRoman(result);
					break;

				case 'small caps':
					applySmallCaps(result);
					break;

				case 'underline':
				case 'underlined':
					applyUnderline(result);
					break;
			}

			trimmedSource = trimmedSource.substr(0, modMatch.index).trim();
		}

		// Anything left over is a font name.

		applyFonts(result, trimmedSource);
	}

	return result;
}
