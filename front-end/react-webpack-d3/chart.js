import "lodash";

// TODO: Data Transformation from "(Key 0, Key 1), Pct_Signup" to "(Key 0, Key 1), Avg(Pct_Signup)"
// TODO: Infer labels from data
// TODO: Accepts ordinal scaled data vs numeric type only
// TODO: Calcuate Improvement from previous cell (use cell not key identifier)
// TODO: Font/Font Size
// TODO: @Pat: Selectively apply UP vs DOWN ARROW
// TODO: Double check CR calc (does this need to be weighted avg?)

queue()
  .defer(d3.tsv, "data-str.tsv")
  .await(TransformData);

function TransformData (errors, data) {
  console.log(data);
}

//Data Manips
  //Avg

  //Improvement Calc

//Set Chart Container Specs

// Color Scale

// Ordinal Scale (Can be flexible enough to accept ordinal or number?)


//Create SVG element

    //Add Defs - Marker - Arrows

//Create g element, bind cohort data to g

  //Create rects
    //Selectively fill based on value

  //Create text - value

  //Create text - improvement

  // Create marker - arrow - Up | Down

//Create axis labels

//Create legend