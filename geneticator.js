#!/usr/bin/env node
const prompt = require('prompt-sync')({sigint: false});
const reset = "\u001b[0m";
const blink = "\u001b[5m";

const nitrogenousBases = {
	A: "T",
	C: "G",
	T: "A",
	G: "C",

	U: "T"
};

const proteinTable = {
	UUU: "Phenylalanine",
	UUC: "Phenylalanine",
	UUA: "Leucine",
	UUG: "Leucine",

	UCU: "Serine",
	UCC: "Serine",
	UCA: "Serine",
	UCG: "Serine",

	UAU: "Tyrosine",
	UAC: "Tyrosine",
	UAA: "STOP",
	UAG: "STOP",
	
	UGU: "Cystein",
	UGC: "Cystein",
	UGA: "STOP",
	UGG: "Tryptophan",

	CUU: "Leucine",
	CUC: "Leucine",
	CUA: "Leucine",
	CUG: "Leucine",

	CCU: "Proline",
	CCC: "Proline",
	CCA: "Proline",
	CCG: "Proline",

	CAU: "Histidine",
	CAC: "Histidine",
	CAA: "Glutamine",
	CAG: "Glutamine",

	CGU: "Arginine",
	CGC: "Arganine",
	CGA: "Arganine",
	CGG: "Arganine",

	AUU: "Isoleucine",
	AUC: "Isoleucine",
	AUA: "Isoleucine",
	AUG: "Methionine", //START

	ACU: "Threonine",
	ACC: "Threonine",
	ACA: "Threonine",
	ACG: "Threonine",

	AAU: "Asparagine",
	AAC: "Asparagine",
	AAA: "Lysine",
	AAG: "Lysine",

	AGU: "Serine",
	AGC: "Serine",
	AGA: "Arginine",
	AGG: "Arginine",

	GUU: "Valine",
	GUC: "Valine",
	GUA: "Valine",
	GUG: "Valine",

	GCU: "Alanine",
	GCC: "Alanine",
	GCA: "Alanine",
	GCG: "Alanine",

	GAU: "Aspartate",
	GAC: "Aspartate",
	GAA: "Glutamate",
	GAG: "Glutamate",

	GGU: "Glycine",
	GGC: "Glycine",
	GGA: "Glycine",
	GGG: "Glycine"
}

function reverseOrder(originalStrand) {
	return originalStrand.split('').reverse().join('');
}

function reverseStrand(originalStrand) {
	let newStrand = "";
	for (let i = 0; i < originalStrand.length; i++) {
		newStrand += nitrogenousBases[originalStrand[i]];
	}
	return newStrand;
}

function convertNA(originalStrand) {
	return (originalStrand.includes('U') ? originalStrand.replaceAll('U', 'T') : originalStrand.replaceAll('T', 'U'));
}

function trim(s) {
	return s.trim().replaceAll(' ', '').replaceAll('\n', '');
}

function convert_S2B(originalStrand) {
	var bytes = [[]];
	for (let i = 0; i < originalStrand.length; i++) {
		let currentIndex = bytes.length - 1;
		if (bytes[currentIndex].length < 3) {
			bytes[currentIndex].push(originalStrand[i]);
		} else {
			bytes.push([]);
			bytes[currentIndex + 1].push(originalStrand[i]);
		}
	}
	return bytes;
}

function convert_B2P(bytes) {
	var start = -1, proteinSequence = [];
	for (let i = 0; i < bytes.length; i++) {
		var protein = (proteinTable[bytes[i].join('')] || ' ');
		if (protein.length < 3) { break; };
		if (start > -1) {
			proteinSequence.push(proteinTable[bytes[i].join('')]);
		}
		if (protein == 'Methionine' && start == -1) {
			proteinSequence.push(proteinTable[bytes[i].join('')]);
			start = i;
		} else if (protein == 'STOP') {
			break;
		}
	}
	return proteinSequence;
}

console.log(`ENTER STRAND TYPE
[0]: DNA Coding Strand
[1]: DNA Template Strand
[2]: mRNA Strand
`);
var type = parseInt(trim(prompt(`>${blink}_${reset}`)));

console.log('Enter your strand from 5-prime to 3-prime.');
var strand = trim(prompt(`>${blink}_${reset}`)).toUpperCase(), mRNA_Bytes,
codingStrand, templateStrand, mRNA_Strand, proteinSequence = [];

switch (type) {
	case (0): {
		codingStrand = JSON.parse(JSON.stringify(strand));
		templateStrand = reverseOrder(reverseStrand(JSON.parse(JSON.stringify(strand))));
		mRNA_Strand = convertNA(JSON.parse(JSON.stringify(codingStrand)));
		break;
	} case (1): {
		templateStrand = JSON.parse(JSON.stringify(strand));
		codingStrand = reverseOrder(reverseStrand(JSON.parse(JSON.stringify(strand))));
		mRNA_Strand = convertNA(JSON.parse(JSON.stringify(codingStrand)));
		break;
	} case (2): {
		mRNA_Strand = JSON.parse(JSON.stringify(strand));
		codingStrand = convertNA(JSON.parse(JSON.stringify(strand)));
		templateStrand = reverseOrder(reverseStrand(JSON.parse(JSON.stringify(templateStrand))));
	}
}

console.log(`STRANDS (5-PRIME TO 3-PRIME):

CODING STRAND:
${codingStrand.split('').join(' ')}

TEMPLATE STRAND:
${templateStrand.split('').join(' ')}


mRNA STRAND:
${mRNA_Strand.split('').join(' ')}
`);

mRNA_Bytes = convert_S2B(mRNA_Strand);
proteinSequence = convert_B2P(mRNA_Bytes);

console.log(`PROTEIN SEQUENCE:\n${proteinSequence.join(', ')}`);

var index, nitrogenousBaseInsertion, lastProteinSequence, mutation;

while (true) {
	lastProteinSequence = JSON.parse(JSON.stringify(proteinSequence));
	console.log(`
Potential modifications to mRNA strand:
[0]: Subtraction
[1]: Addition
[2]: Substitution
`);

	type = parseInt(trim(prompt(`>${blink}_${reset}`)));
	console.log('\nIndex to perform operation on:');
	index = parseInt(trim(prompt(`>${blink}_${reset}`)));

	switch (type) {
		case (0): {
			mRNA_Strand = mRNA_Strand.slice(0, index - 1) + mRNA_Strand.slice(index);
			break;
		} case (1): {
			console.log(`\nNitrogenous base (A/U/C/G) to insert at index ${index}:`);
			nitrogenousBaseInsertion = trim(prompt(`>${blink}_${reset}`)).toUpperCase();
			mRNA_Strand = mRNA_Strand.slice(0, index) + nitrogenousBaseInsertion + mRNA_Strand.slice(index);
			break;
		} case (2): {
			console.log(`\nNitrogenous base (A/U/C/G) to insert at index ${index}:`);
			nitrogenousBaseInsertion = trim(prompt(`>${blink}_${reset}`)).toUpperCase();
			mRNA_Strand = mRNA_Strand.slice(0, index - 1) + nitrogenousBaseInsertion + mRNA_Strand.slice(index);
			break;
		}
	}
	mutation = (lastProteinSequence == proteinSequence ? "SILENT" : proteinSequence.includes('STOP') && proteinSequence.length == mRNA_Bytes.length ? "MISSENCE" : "NONSENCE");
	mRNA_Bytes = convert_S2B(mRNA_Strand);
	proteinSequence = convert_B2P(mRNA_Bytes);
	console.log(`mRNA STRAND:
${mRNA_Strand}

PROTEIN SEQUENCE:
${proteinSequence}

MUTATION DIAGNOSIS:
${mutation}
`);
}