
function kMeans(embeddings, k, maxIterations = 100, tolerance = 1e-4) {
    console.log('embeddings', embeddings);
    const centroids = initializeCentroids(embeddings, k);
    let previousCentroids;

    var clusters;

    for (let i = 0; i < maxIterations; i++) {
        clusters = createClusters(embeddings, centroids);
        
        previousCentroids = centroids.slice();
        updateCentroids(clusters, centroids);
        
        if (hasConverged(previousCentroids, centroids, tolerance)) {
            break;
        }
    }

    return {centroids, clusters};
}

exports.kMeans = kMeans;


function initializeCentroids(embeddings, k) {
    const centroids = [];
    const usedIndices = new Set();
    
    while (centroids.length < k) {
        const index = Math.floor(Math.random() * embeddings.length);
        
        if (!usedIndices.has(index)) {
            usedIndices.add(index);
            centroids.push(embeddings[index].slice());
        }
    }
    
    return centroids;
}

function createClusters(embeddings, centroids) {
    const clusters = Array.from({ length: centroids.length }, () => []);
    
    embeddings.forEach(embedding => {
        let bestIndex = 0;
        let minDistance = Infinity;
        
        centroids.forEach((centroid, index) => {
            const distance = euclideanDistance(embedding, centroid);
            if (distance < minDistance) {
                bestIndex = index;
                minDistance = distance;
            }
        });
        
        clusters[bestIndex].push(embedding);
    });
    
    return clusters;
}

function updateCentroids(clusters, centroids) {
    clusters.forEach((cluster, index) => {
        if (cluster.length === 0) return;
        
        const newCentroid = Array(cluster[0].length).fill(0);
        
        cluster.forEach(embedding => {
            for (let i = 0; i < embedding.length; i++) {
                newCentroid[i] += embedding[i];
            }
        });
        
        for (let i = 0; i < newCentroid.length; i++) {
            newCentroid[i] /= cluster.length;
        }
        
        centroids[index] = newCentroid;
    });
}

function euclideanDistance(a, b) {
    let sum = 0;

    for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
    }

    return Math.sqrt(sum);
}

function hasConverged(prevCentroids, centroids, tolerance) {
    let totalDistance = 0;

    for (let i = 0; i < prevCentroids.length; i++) {
        totalDistance += euclideanDistance(prevCentroids[i], centroids[i]);
    }

    return totalDistance < tolerance;
}

