package com.github.perseacado.aquasketch.frontend.sketch

import com.fasterxml.jackson.annotation.JsonIgnore
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

/**
 * @author Marco Eigletsberger, 09.07.16.
 */
@Document
class Sketch {
    @Id var id: String? = UUID.randomUUID().toString()
    var name: String? = null
    @JsonIgnore var userId: String? = null
    var activeLayer: Long? = null
    var showGrid: Boolean? = true
    var layers: MutableList<Layer>? = mutableListOf()
}

class Layer {
    val id: Long? = 0
    var name: String? = ""
    var visible: Boolean? = true
    var lines: MutableList<Line>? = mutableListOf()
    var data: MutableList<String>? = mutableListOf()
}

class Line {
    var points: MutableList<Array<Int>>? = mutableListOf()
}

class SketchInfo {
    var id: String? = null
    var name: String? = null
}