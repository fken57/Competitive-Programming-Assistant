export class zeroToOneIndexConvert {
    static convert(index: number): number {
        return index + 1;
    }
}

export class oneToZeroIndexConvert {
    static convert(index: number): number {
        return index - 1;
    }
}

export class NeighborListConvert {
    static convert(neighbors: number[]): number[] {
        return neighbors.map(n => zeroToOneIndexConvert.convert(n));
    }
}

export class 